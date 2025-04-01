import { Box, Button, Container, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import homeBluetooth from '../assets/home-bluetooth.png';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:390px)');

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
            bgcolor: "#E4F4FF",
            width: '100%',
            maxWidth: isMobile ? '350px' : '380px',
            mx: 'auto',
            boxShadow: '0 8px 24px rgba(13, 110, 253, 0.12)',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              mb: 2.5,
              fontSize: { xs: '1.6rem', sm: '2rem' },
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '1px',
              background: 'linear-gradient(45deg, #0d6efd 30%, #6610f2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative',
              padding: '0.5rem 0'
            }}
          >
            Internet de las Casas
          </Typography>

          <Box
            sx={{
              width: { xs: '65%', sm: '60%' },
              mb: 3.5,
              display: 'flex',
              justifyContent: 'center',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            <img
              src={homeBluetooth}
              alt="Home with Bluetooth"
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Typography
            sx={{
              mb: 4,
              textAlign: 'center',
              fontSize: { xs: '1rem', sm: '1.1rem' },
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
            Abrir con token
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;