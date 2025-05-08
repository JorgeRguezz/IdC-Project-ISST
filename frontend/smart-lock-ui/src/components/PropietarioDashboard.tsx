import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Badge,
  CircularProgress
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ClockIcon from '@mui/icons-material/AccessTime';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import KeyIcon from '@mui/icons-material/Key';
import { useNavigate } from 'react-router-dom';
import { gapi } from 'gapi-script';
import homeBluetooth from '../assets/home-bluetooth.png';

const CLIENT_ID = '378065249483-h4lad2d3m51n5ag1m0e9he8j5c43tj9u.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const CALENDAR_ID = '3879af64c7bdf344b6c989d6b6bab60e8d2c4701302e694291789c8fe7d04898@group.calendar.google.com'

interface Propiedad {
  id: number;
  nombre: string;
  direccion: string;
  propietarioId: number;
  numeroCerraduras: number;
}

const PropietarioDashboard = () => {
  const navigate = useNavigate();

  // Estado de propiedades
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de Google Calendar
  const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null);

  // Fecha para cabecera del calendario
  const [mes] = useState(new Date().getMonth());
  const [año] = useState(new Date().getFullYear());

  // Contador de notificaciones
  const [notificaciones] = useState(1);

  // Usuario (desde localStorage)
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Fetch propiedades al montar
  useEffect(() => {
    const fetchPropiedades = async () => {
      if (!usuario.id) {
        setError('Usuario no autenticado');
        setCargando(false);
        return;
      }
      try {
        setCargando(true);
        setError(null);
        const resp = await fetch(`http://localhost:8080/api/propiedades/propietario/${usuario.id}`);
        if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
        const data: Propiedad[] = await resp.json();
        setPropiedades(data);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
        setPropiedades([]);
      } finally {
        setCargando(false);
      }
    };
    fetchPropiedades();
  }, [usuario.id]);

  // Inicializar API de Google y comprobar si ya está logueado
  useEffect(() => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({ clientId: CLIENT_ID, scope: SCOPES, discoveryDocs: DISCOVERY_DOCS })
        .then(() => {
          const auth2 = gapi.auth2.getAuthInstance();
          if (auth2.isSignedIn.get()) {
            const profile = auth2.currentUser.get().getBasicProfile();
            setUsuarioEmail(profile.getEmail());
          }
        })
        .catch(console.error);
    });
  }, []);

  // Función para login con Google
  const signInWithGoogle = async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const user = await auth2.signIn();
      const profile = user.getBasicProfile();
      setUsuarioEmail(profile.getEmail());
    } catch (err) {
      console.error('Error al autenticar:', err);
    }
  };

  // Funciones de navegación
  const handleCerrarSesion = () => {
    gapi.auth2.getAuthInstance()?.signOut();
    localStorage.removeItem('usuario');
    navigate('/login');
  };
  const handleVerPropiedades = () => navigate('/propiedades', { state: { propiedades } });
  const handleVerAccesos = () => navigate('/accesos-propietario');
  const handleAbrirPuerta = (p: Propiedad) =>
    navigate(`/abrir-puerta/${p.id}`, { state: { propiedad: p } });

  // Preparamos la URL del iframe sólo si tenemos email
  const iframeSrc = usuarioEmail
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=Europe/Madrid`
    : '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#ebf5ff' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          bgcolor: '#E4F4FF',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={homeBluetooth} alt="Logo" style={{ height: 40, marginRight: 10 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd' }}>
            Inicio
          </Typography>
        </Box>
        <Box>
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
          <IconButton color="primary" onClick={handleCerrarSesion}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {/* Calendario de Google */}
        <Paper sx={{ borderRadius: 3, border: '2px solid #d1d1d1', mb: 3, bgcolor: 'white' }}>
            <Box sx={{ bgcolor: '#e53935', p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                    {mes + 1} / {año}
                </Typography>
            </Box>

        {/* ← Sustituye TODO este bloque por el iframe público + aviso */}
        <Box sx={{ p: 2 }}>
            <iframe
                src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=Europe/Madrid&mode=MONTH`}
                style={{ border: 0, width: '100%', height: '600px' }}
                frameBorder="0"
                scrolling="no"
                title="Google Calendar"
                />
        </Box>
    </Paper>


        {/* Botones de gestión */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button variant="contained" onClick={handleVerPropiedades} sx={{ mr: 2 }}>
            Gestionar Puertas
          </Button>
          <Button variant="contained" onClick={handleVerAccesos}>
            Accesos
          </Button>
        </Box>

        {/* Lista de propiedades */}
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Tus puertas
        </Typography>
        {cargando ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#0d6efd' }} />
            <Typography sx={{ mt: 2 }}>Cargando propiedades...</Typography>
          </Paper>
        ) : error ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography color="error">Error: {error}</Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </Paper>
        ) : propiedades.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No tienes propiedades registradas</Typography>
          </Paper>
        ) : (
          propiedades.map((p) => (
            <Paper
              key={p.id}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {p.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.direccion}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <KeyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {p.numeroCerraduras}{' '}
                  {p.numeroCerraduras === 1 ? 'cerradura' : 'cerraduras'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<KeyIcon />}
                onClick={() => handleAbrirPuerta(p)}
              >
                Abrir puerta
              </Button>
            </Paper>
          ))
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          py: 1.5,
          px: 4,
          borderTop: '1px solid rgba(0,0,0,0.05)',
          bgcolor: 'white'
        }}
      >
        <IconButton color="primary">
          <ClockIcon />
        </IconButton>
        <IconButton color="primary">
          <Badge badgeContent={notificaciones} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton color="primary">
          <SearchIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PropietarioDashboard;
