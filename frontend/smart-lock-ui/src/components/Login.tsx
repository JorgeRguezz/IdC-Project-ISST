import { useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import homeBluetooth from '../assets/home-bluetooth.svg';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Por favor, ingresa tu email y contraseña');
      setShowError(true);
      return;
    }

    setIsLoading(true);

    try {
      // Llamada a la API para autenticar al usuario
      const response = await fetch('http://localhost:8080/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      // Convertir el tipo de usuario a mayúsculas para consistencia
      const userData = {
        ...data,
        tipo: data.tipo.toUpperCase()
      };

      // Guardar información del usuario
      localStorage.setItem('usuario', JSON.stringify(userData));

      console.log('Usuario autenticado:', userData);

      // Redireccionar según el tipo de usuario
      if (userData.tipo === 'PROPIETARIO') {
        console.log('Redirigiendo a dashboard de propietario');
        navigate('/propietario-dashboard');
      } else {
        console.log('Redirigiendo a dashboard de huésped');
        navigate('/huesped-dashboard');
      }

    } catch (error) {
      console.error('Error de login:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
      setShowError(true);
    } finally {
      setIsLoading(false);
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
            maxWidth: '380px',
            mx: 'auto',
            boxShadow: '0 8px 24px rgba(13, 110, 253, 0.12)',
            transition: 'all 0.3s ease-in-out',
            position: 'relative'
          }}
        >
          {/* Back button - Mejorado con icono y efectos */}
          <IconButton
            component={Link}
            to="/"
            sx={{
              position: 'absolute',
              left: 16,
              top: 16,
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
          >
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              mt: 1,
              mb: 3,
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
            Inicio de Sesión
          </Typography>

          <Typography
            sx={{
              mb: 4,
              textAlign: 'center',
              fontSize: '1.3rem',
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
            ¡Bienvenido de nuevo! Inicia sesión aquí
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Typography sx={{ mb: 1, color: '#0d6efd', fontWeight: 'medium' }}>
              Email
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Escribe tu email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#f5f9ff',
                  '& fieldset': {
                    borderColor: '#0d6efd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0b5ed7',
                  },
                }
              }}
            />

            <Typography sx={{ mb: 1, color: '#0d6efd', fontWeight: 'medium' }}>
              Contraseña
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Escribe tu contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: '#0d6efd' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#f5f9ff',
                  '& fieldset': {
                    borderColor: '#0d6efd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#0b5ed7',
                  },
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2" color="#0d6efd">Recordarme</Typography>}
              />
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  He olvidado mi contraseña
                </Typography>
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
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
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
              <Box sx={{ height: 1, bgcolor: '#0d6efd', flex: 1, opacity: 0.2 }} />
              <Typography variant="body2" sx={{ mx: 2, color: '#0d6efd', fontWeight: 'medium' }}>o</Typography>
              <Box sx={{ height: 1, bgcolor: '#0d6efd', flex: 1, opacity: 0.2 }} />
            </Box>

            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                bgcolor: 'white',
                color: '#0d6efd',
                border: '1px solid #0d6efd',
                borderRadius: 50,
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f0f7ff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 15px rgba(13, 110, 253, 0.2)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Registrarse
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowError(false)}
            severity="error"
            sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login;