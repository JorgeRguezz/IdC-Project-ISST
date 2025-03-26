import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import homeBluetooth from '../assets/home-bluetooth.svg';

const Home = () => {
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
        <Typography 
          component="h1" 
          variant="h5" 
          sx={{ 
            color: '#0d6efd',
            fontWeight: 'bold',
            mb: 2
          }}
        >
          Internet de las Casas
        </Typography>

        <Box sx={{ width: '70%', mb: 3 }}>
          <img src={homeBluetooth} alt="Home with Bluetooth" style={{ width: '100%' }} />
        </Box>

        <Typography sx={{ mb: 3, color: '#333', textAlign: 'center' }}>
          ¡Bienvenido! Gestiona y accede a tu alojamiento de forma rápida y segura, sin llaves y con tu móvil
        </Typography>

        <Button
          component={Link}
          to="/login"
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
          Iniciar sesión
        </Button>

        <Button
          component={Link}
          to="/register"
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
          Registrarse
        </Button>

        <Button
          component={Link}
          to="/token"
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
          Abrir con token
        </Button>
      </Paper>
    </Container>
  );
};

export default Home;