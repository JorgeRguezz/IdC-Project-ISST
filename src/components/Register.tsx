import { useState } from 'react';
import { Box, Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Register = () => {
  const [role, setRole] = useState<'propietario' | 'huesped' | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ role, fullName, email, username, password, confirmPassword });
    // Here you would typically handle the registration logic
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
            ¿No tienes cuenta?
          </Typography>
        </Box>

        <Typography sx={{ mb: 2, color: '#333' }}>
          Para registrarte, introduzca los siguientes datos:
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Seleccione su rol:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              fullWidth
              variant={role === 'propietario' ? 'contained' : 'outlined'}
              onClick={() => setRole('propietario')}
              sx={{ 
                py: 1.5,
                bgcolor: role === 'propietario' ? '#0d6efd' : 'transparent',
                borderColor: '#0d6efd',
                color: role === 'propietario' ? 'white' : '#0d6efd',
                '&:hover': {
                  bgcolor: role === 'propietario' ? '#0b5ed7' : 'rgba(13, 110, 253, 0.04)'
                }
              }}
            >
              Propietario
            </Button>
            <Button
              fullWidth
              variant={role === 'huesped' ? 'contained' : 'outlined'}
              onClick={() => setRole('huesped')}
              sx={{ 
                py: 1.5,
                bgcolor: role === 'huesped' ? '#0d6efd' : 'transparent',
                borderColor: '#0d6efd',
                color: role === 'huesped' ? 'white' : '#0d6efd',
                '&:hover': {
                  bgcolor: role === 'huesped' ? '#0b5ed7' : 'rgba(13, 110, 253, 0.04)'
                }
              }}
            >
              Huésped
            </Button>
          </Box>

          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Nombre y apellidos
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fullName"
            placeholder="Escriba su nombre y apellidos"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'white'
              }
            }}
          />

          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Correo electrónico
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            placeholder="Escriba su correo"
            name="email"
            autoComplete="email"
            type="email"
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
            Nombre de usuario
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            placeholder="Escriba su nombre"
            name="username"
            autoComplete="username"
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
            placeholder="Escriba su contraseña"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'white'
              }
            }}
          />

          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Confirmar contraseña
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            placeholder="Repita su contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'white'
              }
            }}
          />

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
            Registrarse
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;