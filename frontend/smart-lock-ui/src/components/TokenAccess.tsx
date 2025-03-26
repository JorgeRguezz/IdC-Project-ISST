import { useState } from 'react';
import { Box, Button, Container, IconButton, Paper, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { ArrowBack, Settings, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const TokenAccess = () => {
  const [token, setToken] = useState('');
  const [cerraduraId, setCerraduraId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validamos el token para abrir la puerta (el endpoint ahora hace ambas cosas)
      const validarResponse = await fetch(`/api/tokens/validar?codigo=${token}&cerraduraId=${cerraduraId || 1}`, {
        method: 'POST',
      });

      if (!validarResponse.ok) {
        const errorData = await validarResponse.text();
        throw new Error(errorData || 'Token inválido o expirado');
      }

      setSnackbar({ open: true, message: 'Puerta abierta correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'Error desconocido', severity: 'error' });
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
              Abrir puerta
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
              Pulse el botón para abrir la puerta
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              bgcolor: '#0d6efd',
              borderRadius: 50,
              '&:hover': {
                bgcolor: '#0b5ed7'
              }
            }}
          >
            {loading ? 'Abriendo...' : 'Abrir puerta'}
          </Button>

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