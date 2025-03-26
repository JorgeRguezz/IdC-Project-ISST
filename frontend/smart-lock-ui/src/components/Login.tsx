import { useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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

      // Guardar información del usuario
      localStorage.setItem('usuario', JSON.stringify(data));

      // Redireccionar según el tipo de usuario
      if (data.tipo === 'propietario') {
        navigate('/propietario-dashboard');
      } else {
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
        {/* Back button and title */}
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            component={Link}
            to="/"
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: '#0d6efd',
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            ←
          </Button>
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
            Inicio de Sesión
          </Typography>
        </Box>

        <Typography sx={{ mb: 2, color: '#333', textAlign: 'center' }}>
          ¡Bienvenido de nuevo! Inicia sesión aquí
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Email
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            placeholder="Escribe su email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'white'
              }
            }}
          />

          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Contraseña
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            placeholder="Escribe su contraseña"
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
                bgcolor: 'white'
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
              label={<Typography variant="body2">Recordarme</Typography>}
            />
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
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
              '&:hover': {
                bgcolor: '#0b5ed7'
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
            <Box sx={{ height: 1, bgcolor: '#ddd', flex: 1 }} />
            <Typography variant="body2" sx={{ mx: 2, color: '#666' }}>o</Typography>
            <Box sx={{ height: 1, bgcolor: '#ddd', flex: 1 }} />
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
              bgcolor: '#0d6efd',
              borderRadius: 50,
              '&:hover': {
                bgcolor: '#0b5ed7'
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
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;