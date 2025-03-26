import { useState } from 'react';
import { Box, Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ code, newPassword, confirmPassword });
    // Here you would typically handle the password reset logic
    // For now, we'll just navigate to the login page
    navigate('/login');
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
            to="/forgot-password"
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

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Typography sx={{ mb: 2, color: '#333' }}>
            Por favor, introduzca el código enviado a su correo electrónico y escriba la nueva contraseña
          </Typography>
          
          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Código
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="code"
            placeholder="Escriba el código"
            name="code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'white'
              }
            }}
          />

          <Typography sx={{ mb: 1, color: '#333', fontWeight: 'medium' }}>
            Nueva contraseña
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            placeholder="Escriba su contraseña"
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
              mb: 2, 
              py: 1.5,
              bgcolor: '#0d6efd',
              borderRadius: 50,
              '&:hover': {
                bgcolor: '#0b5ed7'
              }
            }}
          >
            Cambiar contraseña
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
                ¿No ha recibido el correo electrónico?
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;