import { useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import { useNavigate } from 'react-router-dom';

interface Propiedad {
  id: number;
  nombre: string;
  direccion: string;
}

const Propiedades = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propiedades: Propiedad[] = location.state?.propiedades || [];

  const handleAbrirPuerta = (propiedad: Propiedad) => {
    navigate(`/abrir-puerta/${propiedad.id}`, { state: { propiedad } });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#ebf5ff',
        p: 2
      }}
    >
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start', mb: 2 }}>
        Volver
      </Button>

      <Typography variant="h5" sx={{ mb: 2, color: '#0d6efd', fontWeight: 'bold' }}>
        Mis Propiedades
      </Typography>

      {propiedades.length === 0 ? (
        <Typography>No tienes propiedades registradas.</Typography>
      ) : (
        propiedades.map((propiedad) => (
          <Paper
            key={propiedad.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {propiedad.nombre || `Propiedad #${propiedad.id}`}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {propiedad.direccion}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<KeyIcon />}
              onClick={() => handleAbrirPuerta(propiedad)}
              sx={{ borderRadius: 1, textTransform: 'none' }}
            >
              Abrir puerta
            </Button>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Propiedades;
