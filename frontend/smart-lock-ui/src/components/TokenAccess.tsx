import { useState } from 'react';
import { Box, Button, Container, IconButton, Paper, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import iconoPuerta from '../assets/icono-puerta.png';

// Base URL para todas las llamadas a la API
const API_BASE_URL = 'http://localhost:8080';

const TokenAccess = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Método simplificado para validar y abrir la cerradura asociada al token
  const validarTokenYAbrirPuerta = async (codigo: string): Promise<Response> => {
    try {
      console.log(`Buscando cerradura asociada al token ${codigo}`);

      // Obtenemos todos los tokens para encontrar el que coincide con el código
      const tokensResponse = await fetch(`${API_BASE_URL}/api/tokens`);

      if (!tokensResponse.ok) {
        throw new Error(`Error al obtener tokens (${tokensResponse.status})`);
      }

      const tokens = await tokensResponse.json();
      console.log("Tokens disponibles:", tokens);

      // Buscamos el token con el código proporcionado
      const tokenObj = tokens.find((t: any) => t.codigo === codigo);

      if (!tokenObj) {
        throw new Error('Token no encontrado');
      }

      // Verificamos que el token tenga una cerradura asociada
      if (!tokenObj.cerradura || !tokenObj.cerradura.id) {
        throw new Error('El token no está asociado a ninguna cerradura');
      }

      const cerraduraId = tokenObj.cerradura.id;
      console.log(`Token encontrado para cerradura ID: ${cerraduraId}`);

      // Verificar si el token tiene usos disponibles
      if (tokenObj.usosMaximos > 0 && tokenObj.usosActuales >= tokenObj.usosMaximos) {
        throw new Error('Token sin usos disponibles');
      }

      // Verificar si el toke ha expirado
      if (new Date(tokenObj.fechaExpiracion) < new Date() || tokenObj.fechaExpiracion === null) {
        throw new Error('El token ha expirado');
      }

      // Si llegamos aquí, el token es válido
      // Intentamos obtener el ID del propietario para abrir la puerta
      let usuarioIdParaAbrir;

      // Intentamos obtener el propietario del token si está disponible en la estructura anidada
      if (tokenObj.cerradura.propiedad && tokenObj.cerradura.propiedad.propietario && tokenObj.cerradura.propiedad.propietario.id) {
        usuarioIdParaAbrir = tokenObj.cerradura.propiedad.propietario.id;
      } else {
        // Si no está disponible en la estructura, intentamos obtener la cerradura y de ahí la propiedad y el propietario
        const cerraduraResponse = await fetch(`${API_BASE_URL}/api/cerraduras/${cerraduraId}`);
        if (cerraduraResponse.ok) {
          const cerraduraData = await cerraduraResponse.json();
          if (cerraduraData.propiedad && cerraduraData.propiedad.propietario) {
            usuarioIdParaAbrir = cerraduraData.propiedad.propietario.id;
          }
        }
      }

      // Si todavía no tenemos un ID de usuario, usamos el ID 1 como respaldo
      if (!usuarioIdParaAbrir) {
        usuarioIdParaAbrir = 1; // ID por defecto que asumimos que existe
        console.log("No se pudo obtener el ID del propietario, usando ID por defecto:", usuarioIdParaAbrir);
      } else {
        console.log(`Usando ID de propietario ${usuarioIdParaAbrir} para abrir cerradura`);
      }

      // Enviamos la solicitud para abrir la cerradura
      const abrirResponse = await fetch(`${API_BASE_URL}/api/cerraduras/${cerraduraId}/abrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId: usuarioIdParaAbrir }),
      });

      if (!abrirResponse.ok) {
        throw new Error(`Error al abrir la puerta (${abrirResponse.status})`);
      }

      // Si se abrió la puerta correctamente, actualizamos el contador de usos del token
      try {
        const updatedToken = {
          ...tokenObj,
          usosActuales: (tokenObj.usosActuales || 0) + 1,
        };

        console.log('Actualizando usos del token. Usos actuales:', updatedToken.usosActuales);

        const resA = await fetch(`${API_BASE_URL}/api/tokens/${tokenObj.id}`, {
          method: 'PUT', // Use PUT to update the existing token
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedToken), // Send the updated token data
        });

        if (!resA.ok) {
          console.log('No se ha actualizado los usos del token');
        } else {
          console.log('Usos del token actualizados correctamente');
        }

      } catch (e) {
        console.warn('No se pudo actualizar el uso del token, pero la puerta ya se abrió');
      }

      return new Response(JSON.stringify({
        mensaje: 'Puerta abierta correctamente',
        cerradura: cerraduraId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error en validación del token:', error);
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!token.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, introduce un token',
        severity: 'error'
      });
      setLoading(false);
      return;
    }

    try {
      console.log(`Validando token ${token}`);

      // Usamos el método que busca automáticamente la cerradura asociada al token
      const validarResponse = await validarTokenYAbrirPuerta(token);

      if (!validarResponse.ok) {
        let errorMessage = 'Error al validar token';
        try {
          const errorData = await validarResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Si no podemos extraer el mensaje de error como JSON, usamos el texto de la respuesta
          const errorText = await validarResponse.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseData = await validarResponse.json();
      const cerraduraId = responseData.cerradura;

      setSnackbar({
        open: true,
        message: `Puerta ${cerraduraId} abierta correctamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error desconocido',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: '#E4F4FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        m: 0,
        overflow: 'hidden'
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          py: { xs: 2, sm: 4 },
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            bgcolor: '#E4F4FF',
            width: '100%',
            maxWidth: '350px',
            mx: 'auto',
            boxShadow: '0 8px 24px rgba(13, 110, 253, 0.12)',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Header with back button only */}
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton
              component={Link}
              to="/"
              sx={{
                color: '#0d6efd',
                bgcolor: '#f0f7ff',
                p: 1,
                '&:hover': {
                  bgcolor: '#e1f0ff',
                  transform: 'translateX(-2px)'
                },
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(13, 110, 253, 0.1)',
                borderRadius: '50%'
              }}
              aria-label="volver"
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography
              component="h1"
              variant="h5"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                letterSpacing: '1px',
                background: 'linear-gradient(45deg, #0d6efd 30%, #6610f2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '0.5rem 0'
              }}
            >
              Abrir puerta con token
            </Typography>
          </Box>

          <Typography
            sx={{
              mb: 3,
              textAlign: 'center',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.6,
              maxWidth: '90%',
              fontWeight: 600,
              color: '#0d6efd',
              background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 2px rgba(0,0,0,0.08)',
              letterSpacing: '0.3px',
              padding: '0.5rem 0',
              animation: 'fadeIn 1s ease-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            Introduzca el código de acceso proporcionado por el propietario para abrir la puerta
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="token"
              placeholder="Escriba su token"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              sx={{
                mb: 3,
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(13, 110, 253, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(13, 110, 253, 0.12)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 12px rgba(13, 110, 253, 0.16)'
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontSize: '0.75rem',
                  mt: 0.8,
                  textAlign: 'center',
                  fontWeight: 500,
                  color: '#6c757d'
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '1rem',
                  textAlign: 'center',
                  letterSpacing: '1px'
                }
              }}
              helperText="Introduce el código tal y como te lo proporcionó el propietario"
              autoFocus
              size="medium"
            />

            {/* Door with key illustration */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#E4F4FF',
                borderRadius: 3,
                p: 3,
                mb: 3,
                boxShadow: '0 4px 16px rgba(13, 110, 253, 0.1)',
                width: '100%',
                animation: 'fadeIn 1s ease-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                  animation: 'pulse 2s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                <img 
                  src={iconoPuerta} 
                  alt="Icono de puerta" 
                  style={{ 
                    width: '130px', 
                    height: '130px', 
                    objectFit: 'contain' 
                  }} 
                />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: '1.2rem',
                  background: 'linear-gradient(45deg, #0d6efd 30%, #6610f2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 1px 2px rgba(0,0,0,0.08)'
                }}
              >
                Acceso con token
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#495057',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  maxWidth: '90%'
                }}
              >
                El sistema identificará automáticamente la puerta correspondiente a tu token y la abrirá
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !token.trim()}
              sx={{
                py: 1.5,
                bgcolor: '#0d6efd',
                borderRadius: 50,
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#0b5ed7',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(13, 110, 253, 0.3)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(13, 110, 253, 0.5)'
                }
              }}
            >
              {loading ? 'Validando...' : 'Abrir puerta'}
            </Button>

            {/* Información adicional */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'rgba(13, 110, 253, 0.05)',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(13, 110, 253, 0.08)',
                border: '1px solid rgba(13, 110, 253, 0.1)',
                animation: 'fadeIn 1.2s ease-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#495057',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  fontWeight: 500
                }}
              >
                <strong style={{ color: '#0d6efd' }}>¿Cómo funciona?</strong> El token de acceso es un código único que el propietario genera para permitir la entrada a una vivienda. Cada token está asociado a una cerradura específica y puede tener limitaciones de uso.
              </Typography>
            </Box>

            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              sx={{
                '& .MuiSnackbarContent-root': {
                  borderRadius: 2
                }
              }}
            >
              <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                variant="filled"
                elevation={6}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.2rem'
                  },
                  '& .MuiAlert-message': {
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TokenAccess;