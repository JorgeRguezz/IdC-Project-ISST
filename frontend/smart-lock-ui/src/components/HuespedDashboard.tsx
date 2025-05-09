import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, Avatar, Badge, CircularProgress } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import { gapi } from 'gapi-script';
import homeBluetooth from '../assets/home-bluetooth.png';

interface Cerradura {
    id: number;
    nombre: string;
}

const CLIENT_ID = '378065249483-h4lad2d3m51n5ag1m0e9he8j5c43tj9u.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const CALENDAR_ID = '3879af64c7bdf344b6c989d6b6bab60e8d2c4701302e694291789c8fe7d04898@group.calendar.google.com';

const HuespedDashboard = () => {
    const navigate = useNavigate();
    const [cerraduras, setCerraduras] = useState<Cerradura[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [notificaciones, setNotificaciones] = useState(2);
    const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null);

    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : {};

    const [mes] = useState(new Date().getMonth());
    const [año] = useState(new Date().getFullYear());

    useEffect(() => {
        console.log('Ejecutando useEffect para cargar cerraduras');

        const fetchCerraduras = async () => {
            setCargando(true);
            setError('');

            try {
                const id = usuario?.id;
                if (!id) {
                    console.error('No se pudo identificar el ID del usuario:', usuario);
                    setError('No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
                    setCargando(false);
                    return;
                }

                console.log('Obteniendo cerraduras para el huésped con ID:', id);
                const url = `https://localhost:8443/api/huespedes/${id}/cerraduras`;
                console.log('URL de la solicitud:', url);

                // Llamada a la API para obtener las cerraduras del huésped
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Estado de la respuesta:', response.status);
                console.log('Headers de la respuesta:', [...response.headers.entries()]);

                if (!response.ok) {
                    if (response.status === 404) {
                        // Si el huésped no existe en el sistema o no hay datos, mostrar mensaje de no accesos
                        console.warn('Usuario no encontrado o sin datos (404)');
                        setCerraduras([]);
                        setCargando(false);
                        return;
                    } else if (response.status === 500) {
                        // Error interno del servidor
                        console.error('Error interno del servidor (500)');
                        throw new Error('Hay un problema en el servidor. Por favor, inténtalo más tarde.');
                    } else {
                        // Cualquier otro error
                        console.error(`Error inesperado (${response.status})`);
                        throw new Error(`No se pudieron obtener tus accesos (${response.status}). Por favor, inténtalo de nuevo.`);
                    }
                }

                // Intentar obtener el contenido como texto primero para depuración
                const responseText = await response.text();
                console.log('Respuesta cruda del servidor:', responseText);

                // Intentar analizar el texto como JSON
                let data;
                try {
                    data = responseText ? JSON.parse(responseText) : [];
                    console.log('Datos JSON parseados:', data);
                } catch (e) {
                    console.error('Error al analizar JSON:', e);
                    throw new Error('El servidor devolvió una respuesta inválida. Por favor, inténtalo más tarde.');
                }

                // Si no es array, convertirlo a array vacío para evitar errores
                if (!Array.isArray(data)) {
                    console.warn('La respuesta no es un array:', data);
                    data = [];
                }

                // Si el array está vacío, no mostrar datos de prueba
                if (data.length === 0) {
                    console.warn('No se recibieron datos del backend');
                    setCerraduras([]);
                    setCargando(false);
                    return;
                }

                // Mapear los datos a nuestro formato de Cerradura
                const cerradurasFormateadas = data.map((item: any) => ({
                    id: item.id,
                    nombre: item.nombre || 'Puerta sin nombre'
                }));

                console.log('Cerraduras formateadas:', cerradurasFormateadas);
                setCerraduras(cerradurasFormateadas);
            } catch (error) {
                console.error('Error al obtener cerraduras:', error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('No se pudieron cargar tus accesos. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
                }
            } finally {
                setCargando(false);
            }
        };

        fetchCerraduras();
    }, [usuario?.id]);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleAbrirPuerta = (cerraduraId: number) => {
        navigate(`/abrir-puerta/cerradura/${cerraduraId}`);
    };

    const handleMisPuertas = () => {
        navigate('/mis-accesos');
    };

    const iframeSrc = usuarioEmail
        ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=Europe/Madrid`
        : '';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100vh',
                bgcolor: '#E4F4FF',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3,
                    py: 2,
                    bgcolor: '#E4F4FF',
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src={homeBluetooth} alt="Logo" style={{ height: 40, marginRight: 10 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd' }}>
                        Inicio
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton color="primary">
                        <SettingsIcon />
                    </IconButton>
                    <IconButton color="primary">
                        <Badge badgeContent={notificaciones} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <IconButton color="primary">
                        <SearchIcon />
                    </IconButton>
                    <Avatar sx={{ bgcolor: '#0d6efd' }}>{usuario?.nombre?.charAt(0) || 'U'}</Avatar>
                </Box>
            </Box>

            {/* Contenido */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Hola, {usuario?.nombre || 'Invitado'}
                </Typography>

                {/* Calendario */}
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

                {/* Botón Mis Accesos */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMisPuertas}
                    fullWidth
                    sx={{ mb: 3 }}
                >
                    Mis Accesos
                </Button>

                {/* Lista de Accesos Activos */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Accesos activos
                </Typography>
                {cargando ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : cerraduras.length === 0 ? (
                    <Typography>No tienes accesos asignados</Typography>
                ) : (
                    cerraduras.map((cerradura) => (
                        <Paper key={cerradura.id} sx={{ p: 2, mb: 2 }}>
                            <Typography>{cerradura.nombre}</Typography>
                            <Button onClick={() => handleAbrirPuerta(cerradura.id)}>Abrir</Button>
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
                    bgcolor: 'white',
                }}
            >
                <IconButton color="primary">
                    <SettingsIcon />
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

export default HuespedDashboard;