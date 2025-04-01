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

  const handleAnadirPuerta = () => {
    navigate('/propiedades/anadir');
  };

  const handleGestionarAcceso = (propiedad: Propiedad) => {
    // Navegar a la vista de gestion de acceso, pasando los datos de la propiedad
    navigate('/propiedades/gestionar-acceso', { state: { propiedad }});
  };

  const handleGestionarToken = (propiedad: Propiedad) => {
    // Navegar a la vista de gestion de token, pasando los datos de la propiedad
    navigate('/propiedades/gestionar-token', { state: { propiedad }});
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#ebf5ff',
        px: 2,
        py: 2,
        overflowY: 'auto'
      }}
    >
      {/* Botón volver */}
      <Box
        sx={{
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/propietario-dashboard')}
          sx={{
            alignSelf: 'flex-start',
            mb: 0,
            textTransform: 'none',
            fontWeight: 'medium'
          }}
        >
          Volver
        </Button>
      </Box>
  
  
      {/* Título */}
      <Typography variant="h5" sx={{ mt: 2, mb: 3, color: '#0d6efd', fontWeight: 'bold' }}>
        Mis puertas
      </Typography>
  
      {/* Contenido */}
      {propiedades.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}
        >
          <Typography>No tienes propiedades registradas.</Typography>
        </Paper>
      ) : (
        propiedades.map((propiedad) => (
          <Paper
            key={propiedad.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              display: 'flex',
              gap: 2
            }}
          >
  
            {/* Info */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                sx={{
                  color: '#0d6efd',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  mb: 1
                }}
              >
                {propiedad.direccion}
              </Typography>
  
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<KeyIcon />}
                  onClick={() => handleGestionarToken(propiedad)}
                  sx={{ borderRadius: 1, textTransform: 'none' }}
                >
                  Generar token
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<KeyIcon />}
                  onClick={() => handleGestionarAcceso(propiedad)}
                  sx={{ borderRadius: 1, textTransform: 'none' }}
                >
                  Gestionar acceso
                </Button>
              </Box>
            </Box>
          </Paper>
        ))
      )}
  
      {/* CTA para añadir nueva puerta */}
      <Button
        onClick={handleAnadirPuerta}
        sx={{
          mt: 3,
          textTransform: 'none',
          alignSelf: 'flex-start',
          fontWeight: 'medium',
          color: '#0d6efd'
        }}
      >
        + Añadir puerta
      </Button>
    </Box>
  );
  
};

export default Propiedades;
