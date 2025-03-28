import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Token {
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  unaVez: boolean;
  cerradura?: {
    id: number;
  };
}

const TokenGenerado: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, propiedad } = location.state || {};

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/propiedades', { state: { propiedades: [propiedad] } });
    }, 7000);

    return () => clearTimeout(timeout);
  }, [navigate, propiedad]);

  if (!token) {
    return (
      <Box sx={{ p: 3, bgcolor: '#ebf5ff', minHeight: '100vh' }}>
        <Typography variant="h6" color="error">
          Error: No se ha recibido el token.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#ebf5ff',
      minHeight: '100vh',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: 500,
        bgcolor: 'white',
        borderRadius: 2
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/propiedades', { state: { propiedades: [propiedad] } })}
          sx={{ mb: 2, color: '#0d6efd' }}
        >
          Volver
        </Button>

        <Typography variant="h5" sx={{ mb: 3, color: '#0d6efd', fontWeight: 'bold' }}>
          🔐 Token generado con éxito
        </Typography>

        <Box sx={{ '& > p': { mb: 1.5 } }}>
          <Typography><strong>Token:</strong> {token.codigo}</Typography>
          <Typography><strong>Fecha inicio:</strong> {new Date(token.fechaInicio).toLocaleString()}</Typography>
          <Typography><strong>Fecha fin:</strong> {new Date(token.fechaFin).toLocaleString()}</Typography>
          <Typography><strong>Una sola vez:</strong> {token.unaVez ? 'Sí' : 'No'}</Typography>
          {token.cerradura && (
            <Typography><strong>Cerradura ID:</strong> {token.cerradura.id}</Typography>
          )}
        </Box>

        <Typography sx={{ mt: 3, color: 'text.secondary' }}>
          Serás redirigido a tus propiedades en unos segundos...
        </Typography>
      </Paper>
    </Box>
  );
};

export default TokenGenerado;