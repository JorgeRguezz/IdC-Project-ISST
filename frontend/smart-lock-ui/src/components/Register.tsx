import { useState } from 'react';
import { Box, Button, Container, IconButton, InputAdornment, Paper, TextField, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validaciones básicas
    if (!role) {
      setError('Por favor, seleccione un rol');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Preparar datos para enviar al backend
    const userData = {
      nombre: fullName,
      email: email,
      telefono: username, // Usando el campo username como teléfono
      contrasena: password
    };

    setLoading(true);
    setError(null);

    try {
      // Determinar la URL del endpoint según el rol seleccionado
      const endpoint = role === 'propietario'
        ? 'http://localhost:8080/api/usuarios/propietario'
        : 'http://localhost:8080/api/usuarios/huesped';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      // Registro exitoso
      setSuccess(true);

      // Limpiar formulario
      setRole(null);
      setFullName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
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
          {/* Back button - Mejorado */}
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
            variant="h5"
            sx={{
              mt: 1,
              mb: 2,
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
            ¿No tienes cuenta?
          </Typography>

          <Typography
            sx={{
              mb: 4,
              textAlign: 'center',
              fontSize: '1.1rem',
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
            Para registrarte, introduce tus datos:
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Typography sx={{ mb: 1, color: '#0d6efd', fontWeight: 'medium' }}>
              Seleccione su rol:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant={role === 'propietario' ? 'contained' : 'outlined'}
                onClick={() => setRole('propietario')}
                sx={{
                  py: 1.5,
                  bgcolor: role === 'propietario' ? '#0d6efd' : 'transparent',
                  borderColor: '#0d6efd',
                  color: role === 'propietario' ? 'white' : '#0d6efd',
                  borderRadius: 50,
                  fontWeight: 600,
                  boxShadow: role === 'propietario' ? '0 4px 12px rgba(13, 110, 253, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: role === 'propietario' ? '#0b5ed7' : 'rgba(13, 110, 253, 0.04)',
                    transform: 'translateY(-2px)',
                    boxShadow: role === 'propietario' ? '0 6px 15px rgba(13, 110, 253, 0.3)' : '0 2px 8px rgba(13, 110, 253, 0.1)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
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
                  borderRadius: 50,
                  fontWeight: 600,
                  boxShadow: role === 'huesped' ? '0 4px 12px rgba(13, 110, 253, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: role === 'huesped' ? '#0b5ed7' : 'rgba(13, 110, 253, 0.04)',
                    transform: 'translateY(-2px)',
                    boxShadow: role === 'huesped' ? '0 6px 15px rgba(13, 110, 253, 0.3)' : '0 2px 8px rgba(13, 110, 253, 0.1)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  }
                }}
              >
                Huésped
              </Button>
            </Box>

            <Typography sx={{ mb: 1, color: '#0d6efd', fontWeight: 'medium' }}>
              Nombre y apellidos
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              placeholder="Escribe tu nombre y apellidos"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              Correo electrónico
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Escribe tu correo"
              name="email"
              autoComplete="email"
              type="email"
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
              Teléfono móvil
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              placeholder="Escribe tu número de teléfono"
              name="username"
              autoComplete="tel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
                      sx={{ color: '#0d6efd' }}
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
              Confirmar contraseña
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              placeholder="Repite tu contraseña"
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
                      sx={{ color: '#0d6efd' }}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
              <Box sx={{ height: 1, bgcolor: '#0d6efd', flex: 1, opacity: 0.2 }} />
              <Typography variant="body2" sx={{ mx: 2, color: '#0d6efd', fontWeight: 'medium' }}>¿Ya tienes cuenta?</Typography>
              <Box sx={{ height: 1, bgcolor: '#0d6efd', flex: 1, opacity: 0.2 }} />
            </Box>

            <Button
              component={Link}
              to="/login"
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
              Iniciar sesión
            </Button>
          </Box>

          {/* Notificaciones */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setError(null)}
              severity="error"
              sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              {error}
            </Alert>
          </Snackbar>

          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={() => setSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSuccess(false)}
              severity="success"
              sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              ¡Registro exitoso! Redirigiendo al login...
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;