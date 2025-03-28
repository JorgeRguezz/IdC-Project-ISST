import { useState } from 'react';
import { Box, Button, Container, IconButton, Paper, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { ArrowBack, Settings, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';

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
          usosActuales: (tokenObj.usosActuales || 0) + 1
        };

        await fetch(`${API_BASE_URL}/api/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedToken),
        });
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
    <Container component="main" maxWidth="xs" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          bgcolor: '#f5f9ff'
        }}
      >
        {/* Header with back, settings, and logout buttons */}
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{
              color: '#0d6efd',
              '&:hover': { bgcolor: 'transparent' }
            }}
            aria-label="volver"
          >
            <ArrowBack />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              color: '#0d6efd',
              fontWeight: 'bold'
            }}
          >
            Abrir puerta con token
          </Typography>
          <IconButton
            sx={{
              color: '#0d6efd',
              '&:hover': { bgcolor: 'transparent' }
            }}
            aria-label="ajustes"
          >
            <Settings />
          </IconButton>
          <IconButton
            sx={{
              color: '#0d6efd',
              '&:hover': { bgcolor: 'transparent' }
            }}
            aria-label="cerrar sesión"
          >
            <Logout />
          </IconButton>
        </Box>

        <Typography sx={{ mb: 2, color: '#333', textAlign: 'center' }}>
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
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'white'
              }
            }}
            helperText="Introduce el código tal y como te lo proporcionó el propietario"
            autoFocus
          />

          {/* Door with key illustration */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#e6f0ff',
              borderRadius: 2,
              p: 3,
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <rect x="20" y="10" width="40" height="80" fill="#0d6efd" />
                <rect x="60" y="40" width="20" height="20" fill="#0d6efd" />
                <circle cx="30" cy="50" r="5" fill="white" />
                <path d="M70 50 L90 50 L85 45 L90 50 L85 55 Z" fill="#0d6efd" />
                <circle cx="80" cy="50" r="10" fill="#0d6efd" stroke="white" strokeWidth="2" />
                <circle cx="80" cy="50" r="3" fill="white" />
              </svg>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: '#0d6efd',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              Acceso con token
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
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
              '&:hover': {
                bgcolor: '#0b5ed7'
              }
            }}
          >
            {loading ? 'Validando...' : 'Abrir puerta'}
          </Button>

          {/* Información adicional */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              <strong>¿Cómo funciona?</strong> El token de acceso es un código único que el propietario genera para permitir la entrada a una vivienda. Cada token está asociado a una cerradura específica y puede tener limitaciones de uso.
            </Typography>
          </Box>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Paper>
    </Container>
  );
};

export default TokenAccess;