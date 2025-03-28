import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, IconButton, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import EditIcon from '@mui/icons-material/Edit';

interface Propiedad {
  id: number;
  nombre?: string;
  direccion: string;
  imagen?: string;
}

const Propiedades = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propiedades: Propiedad[] = location.state?.propiedades || [];

  const handleAbrirPuerta = (propiedad: Propiedad) => {
    navigate(`/abrir-puerta/${propiedad.id}`, { state: { propiedad } });
  };

  const handleEditarPropiedad = (propiedad: Propiedad) => {
    navigate(`/editar-propiedad/${propiedad.id}`, { state: { propiedad } });
  };
  
  const handleGenerarToken = (propiedad: Propiedad) => {
    navigate(`/generar-token/${propiedad.id}`);
  };

  const handleAnadirPuerta = () => {
    navigate('/propiedades/anadir');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#ebf5ff', p: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start', mb: 2 }}>
        Volver
      </Button>

      <Typography variant="h5" sx={{ mb: 2, color: '#0d6efd', fontWeight: 'bold' }}>
        Mis puertas
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
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={propiedad.imagen || '/ciudad-default.jpg'}
                alt={`Imagen de ${propiedad.nombre}`}
                style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, marginRight: 16 }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {propiedad.nombre || `Propiedad #${propiedad.id}`}
                  </Typography>
                  <IconButton size="small" onClick={() => handleEditarPropiedad(propiedad)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer', mb: 1 }}
                >
                  {propiedad.direccion}
                </Typography>
                <Link
                  component="button"
                  onClick={() => navigate(`/generar-token/${propiedad.id}`, { state: { propiedad } })}
                  underline="hover"
                  sx={{ fontSize: 14, color: "#0d6efd", mr: 2 }}
                >
                Generar token
                </Link>


                <Link href="#" underline="hover" sx={{ fontSize: 14, color: '#0d6efd' }}>
                  Gestionar acceso
                </Link>
              </Box>
            </Box>
          </Paper>
        ))
      )}

      <Link
        component="button"
        onClick={handleAnadirPuerta}
        underline="hover"
        sx={{ color: '#0d6efd', fontWeight: 'medium', mt: 2, alignSelf: 'flex-start' }}
      >
        Añadir puerta
      </Link>
    </Box>
  );
};

export default Propiedades;
