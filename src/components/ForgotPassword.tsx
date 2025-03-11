import { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ email });
    // Here you would typically handle the email submission logic
    // For now, we'll just navigate to the reset password page
    navigate('/reset-password');
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
        {/* Header with icon and title */}
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            component={Link} 
            to="/login"
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
            Restablecer contraseña
          </Typography>
        </Box>

        <Typography sx={{ mb: 2, color: '#333', textAlign: 'center' }}>
          ¿Ha olvidado su contraseña?
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Typography sx={{ mb: 1, color: '#333' }}>
            Por favor, ingresa la dirección de correo electrónico asociada a la cuenta:
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            placeholder="Escriba su correo"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ 
              mb: 3,
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
              mb: 3, 
              py: 1.5,
              bgcolor: '#0d6efd',
              borderRadius: 50,
              '&:hover': {
                bgcolor: '#0b5ed7'
              }
            }}
          >
            Enviar
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
            <Box sx={{ height: 1, bgcolor: '#ddd', flex: 1 }} />
            <Typography variant="body2" sx={{ mx: 2, color: '#666' }}>o</Typography>
            <Box sx={{ height: 1, bgcolor: '#ddd', flex: 1 }} />
          </Box>

          <Button
            component={Link}
            to="/login"
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
            Iniciar sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;