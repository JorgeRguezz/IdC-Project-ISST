import { useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import homeBluetooth from '../assets/home-bluetooth.svg';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ username, password, rememberMe });
    // Here you would typically handle the login logic
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
            Nombre de usuario
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            placeholder="Escribe su nombre"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            Iniciar sesión
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
    </Container>
  );
};

export default Login;