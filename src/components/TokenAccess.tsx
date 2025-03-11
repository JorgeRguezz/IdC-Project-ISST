import { useState } from 'react';
import { Box, Button, Container, IconButton, Paper, TextField, Typography } from '@mui/material';
import { ArrowBack, Settings, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const TokenAccess = () => {
  const [token, setToken] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ token });
    // Here you would typically handle the token submission logic
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
            sx={{ 
              py: 1.5,
              bgcolor: '#0d6efd',
              borderRadius: 50,
              '&:hover': {
                bgcolor: '#0b5ed7'
              }
            }}
          >
            Abrir puerta
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TokenAccess;