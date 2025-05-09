import { useState, useEffect, useRef } from 'react';
import { Box, Button, Container, IconButton, Paper, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import iconoPuerta from '../assets/icono-puerta.png';

// Base URL para todas las llamadas a la API
const API_BASE_URL = 'https://localhost:8443';

const TokenAccess = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [cerraduraIdAbierta, setCerraduraIdAbierta] = useState<number | null>(null);
  const [puertaAbiertaExitosamente, setPuertaAbiertaExitosamente] = useState<boolean>(false);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ... existing code ...
  const validarTokenYAbrirPuerta = async (codigo: string): Promise<{ abrirResponse: Response, cerraduraId: number }> => {
    try {
      console.log(`Buscando cerradura asociada al token ${codigo}`);
      const tokensResponse = await fetch(`${API_BASE_URL}/api/tokens`);
      if (!tokensResponse.ok) {
        throw new Error(`Error al obtener tokens (${tokensResponse.status})`);
      }
      const tokens = await tokensResponse.json();
      console.log("Tokens disponibles:", tokens);

      const tokenObj = tokens.find((t: any) => t.codigo === codigo);
      if (!tokenObj) {
        throw new Error('Token no encontrado');
      }
      console.log("Token encontrado:", tokenObj);

      const cerraduraId = tokenObj.cerradura?.id;
      if (!cerraduraId) {
        throw new Error('El token no está asociado a una cerradura válida.');
      }
      console.log(`Token encontrado para cerradura ID: ${cerraduraId}`);

      // Obtener el ID del propietario de la cerradura haciendo una llamada a /api/cerraduras/{cerraduraId}/info
      console.log(`Consultando información de la cerradura ${cerraduraId} para obtener el ID del propietario.`);
      const cerraduraInfoResponse = await fetch(`${API_BASE_URL}/api/cerraduras/${cerraduraId}/info`);
      
      if (!cerraduraInfoResponse.ok) {
        let errorMsg = `Error al obtener información de la cerradura ${cerraduraId} (${cerraduraInfoResponse.status})`;
        try {
          const errorData = await cerraduraInfoResponse.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          const textError = await cerraduraInfoResponse.text();
          errorMsg = textError || errorMsg;
        }
        console.error('Error al obtener info de cerradura:', cerraduraInfoResponse.status, errorMsg);
        throw new Error(errorMsg);
      }
      
      const cerraduraInfo = await cerraduraInfoResponse.json();
      
      const usuarioIdParaAbrir = cerraduraInfo.propietarioId; // Asumimos que el DTO tendrá propietarioId

      if (!usuarioIdParaAbrir) {
        console.error("cerraduraInfo recibida sin propietarioId:", cerraduraInfo);
        throw new Error('No se pudo determinar el ID del propietario desde la información de la cerradura. Verifique que el backend en /api/cerraduras/{id}/info devuelve propietarioId.');
      }
      console.log(`ID del propietario obtenido de /info: ${usuarioIdParaAbrir}`);

      // Validaciones adicionales del token (similares a AbrirPuerta.tsx)
      if (tokenObj.usosMaximos != null && tokenObj.usosMaximos > 0 && tokenObj.usosActuales >= tokenObj.usosMaximos) {
        throw new Error('Token sin usos disponibles');
      }
      if (tokenObj.fechaExpiracion && new Date(tokenObj.fechaExpiracion) < new Date()) {
        throw new Error('Token expirado');
      }

      console.log(`Intentando abrir cerradura ID ${cerraduraId} con usuario ID (propietario del token) ${usuarioIdParaAbrir}`);

      const abrirResponse = await fetch(`${API_BASE_URL}/api/cerraduras/${cerraduraId}/abrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId: usuarioIdParaAbrir }),
      });

      if (!abrirResponse.ok) {
        // Intentar parsear el error del backend si está en JSON
        let errorMsg = `Error al abrir la puerta (${abrirResponse.status})`;
        try {
          const errorData = await abrirResponse.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {
          // Si no es JSON, usar el texto de la respuesta o un mensaje genérico
                  const textError = await abrirResponse.text();
                  errorMsg = textError || errorMsg;
        }
        console.error('Error al abrir la puerta:', abrirResponse.status, errorMsg);
        throw new Error(errorMsg);
      }
      
      // Aquí podrías considerar si necesitas invalidar/actualizar el token en el backend si es de un solo uso.
      // Por ejemplo, llamando a un endpoint para incrementar `usosActuales`.
      // Esto usualmente lo maneja el backend directamente tras una operación exitosa.

      console.log('Puerta abierta con éxito usando el token.');
      return { abrirResponse, cerraduraId };

    } catch (error) {
      console.error("Error en validarTokenYAbrirPuerta:", error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      setSnackbar({ open: true, message: 'Por favor, introduce un token.', severity: 'error' });
      return;
    }
    setLoading(true);
    setPuertaAbiertaExitosamente(false); // Resetear antes de un nuevo intento
    setCerraduraIdAbierta(null); // Resetear antes de un nuevo intento
    try {
      console.log(`Validando token ${token}`);
      const { cerraduraId } = await validarTokenYAbrirPuerta(token.trim());
      setSnackbar({ open: true, message: 'Puerta abierta con éxito.', severity: 'success' });
      setToken(''); 
      setCerraduraIdAbierta(cerraduraId);
      setPuertaAbiertaExitosamente(true);
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido procesando el token.';
      setSnackbar({ open: true, message: `${errorMessage}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (puertaAbiertaExitosamente && cerraduraIdAbierta) {
        // Limpiar cualquier temporizador existente para evitar múltiples cierres
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
        }

        console.log(`Programando cierre automático para la cerradura ${cerraduraIdAbierta} en 60 segundos.`);
        autoCloseTimeoutRef.current = setTimeout(() => {
            console.log(`Ejecutando cierre automático para la cerradura ${cerraduraIdAbierta}.`);
            fetch(`${API_BASE_URL}/api/cerraduras/${cerraduraIdAbierta}/cerrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.text(); 
                    console.error('Error al cerrar la puerta automáticamente:', response.status, errorData);
                } else {
                    console.log('Puerta cerrada automáticamente con éxito.');
                }
            })
            .catch(error => {
                console.error('Error en la llamada fetch para cerrar la puerta automáticamente:', error);
            })
            .finally(() => {
                autoCloseTimeoutRef.current = null; 
                setPuertaAbiertaExitosamente(false); // Resetear estado para evitar re-ejecución accidental
                setCerraduraIdAbierta(null); // Resetear estado
            });
        }, 60000); // 60000 ms = 1 minuto
    }

    // Función de limpieza: se ejecuta cuando el componente se desmonta o antes de que el efecto se ejecute de nuevo
    return () => {
        if (autoCloseTimeoutRef.current) {
            console.log(`Limpiando temporizador de cierre automático para la cerradura ${cerraduraIdAbierta} al desmontar o cambiar dependencias.`);
            clearTimeout(autoCloseTimeoutRef.current);
            autoCloseTimeoutRef.current = null;
        }
    };
  }, [puertaAbiertaExitosamente, cerraduraIdAbierta]);

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