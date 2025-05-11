import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress, Button, Badge, Menu, MenuItem, Avatar, ListItemIcon } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ClockIcon from '@mui/icons-material/AccessTime';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';
import homeBluetooth from '../assets/home-bluetooth.png';
import { gapi } from 'gapi-script';
import { initGapi, signInWithGoogle } from './GoogleAuth';

const CLIENT_ID = '378065249483-h4lad2d3m51n5ag1m0e9he8j5c43tj9u.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
// const CALENDAR_ID = '3879af64c7bdf344b6c989d6b6bab60e8d2c4701302e694291789c8fe7d04898@group.calendar.google.com'

interface Propiedad {
    id: number;
    nombre: string;
    direccion: string;
    propietarioId: number;
    numeroCerraduras: number;
}

const PropietarioDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Estado de propiedades
    const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Estado de Google Calendar
    const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null);
    const [isGapiLoaded, setIsGapiLoaded] = useState<boolean>(false);
    const [gapiError, setGapiError] = useState<string | null>(null);

    // Fecha para cabecera del calendario
    const [mes] = useState(new Date().getMonth());
    const [año] = useState(new Date().getFullYear());

    // Contador de notificaciones
    const [notificaciones] = useState<number>(1);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Recuperación de propiedades desde el backend
    useEffect(() => {
        // initGapi();
        const fetchPropiedades = async () => {
            if (!usuario.id) {
                console.error('No hay ID de usuario en localStorage');
                setError('Usuario no autenticado');
                setCargando(false);
                return;
            }
            
            try {
                setCargando(true);
                setError(null);

                console.log('Iniciando solicitud al backend...');
                const response = await fetch(`https://localhost:8443/api/propiedades/propietario/${usuario.id}`);
                console.log('Respuesta recibida, status:', response.status);

                if (!response.ok) {
                    throw new Error(`Error https: ${response.status}`);
                }

                // Obtener la respuesta como texto plano
                const text = await response.text();
                console.log('Respuesta como texto:', text);

                if (!text || text.trim() === '' || text === '[]') {
                    console.warn('La respuesta está vacía o es un array vacío');
                    setPropiedades([]);
                    setCargando(false);
                    return;
                }

                // Limpiar cualquier carácter extraño que pudiera haber en la respuesta
                const cleanedText = text.trim();
                console.log('Texto limpio para parsear:', cleanedText);

                try {
                    // Intentar parsear la respuesta como JSON
                    const data = JSON.parse(cleanedText);
                    console.log('Datos parseados correctamente:', data);

                    // Verificar que los datos tienen la estructura esperada
                    if (Array.isArray(data)) {
                        console.log('Los datos son un array con', data.length, 'elementos');

                        // Mapear cada item para asegurar que cumple con la interfaz Propiedad
                        const propiedadesSeguras = data.map(item => {
                            // Crear un objeto con valores por defecto para todo
                            const propiedadSegura: Propiedad = {
                                id: typeof item.id === 'number' ? item.id : 0,
                                nombre: typeof item.nombre === 'string' ? item.nombre : 'Sin nombre',
                                direccion: typeof item.direccion === 'string' ? item.direccion : 'Sin dirección',
                                propietarioId: typeof item.propietarioId === 'number' ? item.propietarioId : usuario.id,
                                numeroCerraduras: typeof item.numeroCerraduras === 'number' ? item.numeroCerraduras : 0
                            };
                            return propiedadSegura;
                        });

                        console.log('Propiedades procesadas:', propiedadesSeguras);
                        setPropiedades(propiedadesSeguras);
                    } else if (typeof data === 'object' && data !== null) {
                        // Si es un objeto pero no un array, quizás podríamos intentar adaptarlo
                        console.warn('La respuesta es un objeto, no un array:', data);
                        setPropiedades([]);
                    } else {
                        console.warn('La respuesta no es un array ni un objeto:', data);
                        setPropiedades([]);
                    }
                } catch (parseError) {
                    console.error('Error al parsear respuesta JSON:', parseError);
                    console.error('Texto que causó el error:', cleanedText);
                    throw new Error('Error al parsear la respuesta: formato JSON inválido');
                }
            } catch (error) {
                console.error('Error al obtener propiedades:', error);
                setError(error instanceof Error ? error.message : 'Error desconocido');
                setPropiedades([]);
            } finally {
                setCargando(false);
            }
        };

        fetchPropiedades();
    }, [usuario.id]);


    // Inicializar API de Google y comprobar si ya está logueado
    useEffect(() => {
        const updateSigninStatus = (isSignedIn: boolean) => {
            if (isSignedIn) {
                const authInstance = gapi.auth2.getAuthInstance();
                if (authInstance && authInstance.currentUser.get()) {
                    const profile = authInstance.currentUser.get().getBasicProfile();
                    if (profile) {
                        setUsuarioEmail(profile.getEmail());
                        console.log('Usuario de Google conectado:', profile.getEmail());
                        setGapiError(null);
                    } else {
                        console.warn('Perfil de Google no encontrado después del inicio de sesión.');
                        setUsuarioEmail(null);
                    }
                } else {
                    console.warn('Instancia de autenticación o usuario actual de Google no disponible.');
                    setUsuarioEmail(null);
                }
            } else {
                setUsuarioEmail(null);
                console.log('Usuario de Google desconectado.');
            }
        };

        const initClient = () => {
            gapi.client.init({
                clientId: CLIENT_ID,
                scope: SCOPES,
                discoveryDocs: DISCOVERY_DOCS,
            }).then(() => {
                setIsGapiLoaded(true);
                const authInstance = gapi.auth2.getAuthInstance();
                if (authInstance) {
                    authInstance.isSignedIn.listen(updateSigninStatus);
                    updateSigninStatus(authInstance.isSignedIn.get());
                } else {
                    console.error('Error: gapi.auth2.getAuthInstance() devolvió null o undefined');
                    setGapiError('No se pudo inicializar la autenticación de Google.');
                }
            }).catch((error: any) => {
                console.error('Error initializing Google API client:', error);
                setGapiError('No se pudo inicializar la API de Google Calendar. Inténtalo de nuevo más tarde.');
                setIsGapiLoaded(true); 
            });
        };

        try {
            gapi.load('client:auth2', initClient);
        } catch (e) {
            console.error("Error al cargar gapi.load:", e);
            setGapiError('Error crítico al cargar la API de Google. Refresca la página.');
            setIsGapiLoaded(true);
        }
    }, []);

    const handleCerrarSesion = () => {
        gapi.auth2.getAuthInstance()?.signOut();
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    // Función manejadora para el botón de inicio de sesión con Google
    const handleGoogleSignInButtonClick = () => {
        setGapiError(null); 
        if (gapi && gapi.auth2) {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance) {
                if (authInstance.isSignedIn.get()) {
                    console.log('Ya estás logueado con Google.');
                    // Optionally, refresh profile info if needed, though listener should handle it
                    const profile = authInstance.currentUser.get().getBasicProfile();
                    if (profile) setUsuarioEmail(profile.getEmail());
                    return;
                }
                authInstance.signIn().then(() => {
                    // Listener 'isSignedIn.listen' should handle updating state.
                    console.log('Inicio de sesión con Google solicitado.');
                }).catch((error: any) => {
                    console.error('Error al iniciar sesión con Google:', error);
                    if (error.error === "popup_closed_by_user") {
                        setGapiError('El inicio de sesión con Google fue cancelado.');
                    } else if (error.error === "access_denied") {
                        setGapiError('Acceso denegado. Por favor, otorga los permisos necesarios.');
                    } else {
                        setGapiError('No se pudo iniciar sesión con Google. Verifica tu conexión o configuración.');
                    }
                });
            } else {
                console.error('Google Auth instance no está disponible.');
                setGapiError('La autenticación de Google no está lista. Inténtalo de nuevo.');
            }
        } else {
            console.error('GAPI o gapi.auth2 no están cargados.');
            setGapiError('La API de Google no se ha cargado correctamente. Refresca la página.');
        }
    };

    const handleVerPropiedades = () => {
        navigate('/propiedades', { state: { propiedades } });
    };

    const handleVerAccesos = () => {
        navigate('/accesos-propietario');
    };

    const handleAbrirPuerta = (propiedad: Propiedad) => {
        // Navegar a la vista de apertura de puerta, pasando los datos de la propiedad
        navigate(`/abrir-puerta/${propiedad.id}`, { state: { propiedad } });
    };

    // // Preparamos la URL del iframe sólo si tenemos email
    // const iframeSrc = usuarioEmail
    //     ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=Europe/Madrid`
    //     : '';

    // // Función para generar fechas del calendario
    // const generarCalendario = () => {
    //     const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    //     const diasPrevios = [];
    //     for (let i = 0; i < primerDia; i++) {
    //         diasPrevios.push(
    //             <Box key={`prev-${i}`} sx={{ width: 24, height: 24, m: 0.5, color: '#ccc' }}></Box>
    //         );
    //     }

    //     const dias = [];
    //     for (let i = 1; i <= diasEnMes; i++) {
    //         dias.push(
    //             <Box
    //                 key={i}
    //                 sx={{
    //                     width: 24,
    //                     height: 24,
    //                     m: 0.5,
    //                     borderRadius: '50%',
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                     bgcolor: i === hoy.getDate() ? '#0d6efd' : 'transparent',
    //                     color: i === hoy.getDate() ? 'white' : 'inherit'
    //                 }}
    //             >
    //                 {i}
    //             </Box>
    //         );
    //     }

    //     return { diasSemana, diasPrevios, dias };
    // };

    // Estado para el menú desplegable
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        gapi.auth2.getAuthInstance()?.signOut(); // Cerrar sesión de Google
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100vh',
                bgcolor: '#ebf5ff',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    bgcolor: '#E4F4FF',
                    borderBottom: '1px solid #e0e0e0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={homeBluetooth}
                        alt="Logo"
                        style={{ height: 40, marginRight: 10 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd' }}>
                        Inicio
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
                    <Avatar sx={{ bgcolor: '#0d6efd' }}>
                        {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <Typography sx={{ ml: 1, fontWeight: 'bold', color: '#333' }}>
                        {usuario.nombre || 'Usuario'}
                    </Typography>
                </Box>

                {/* Menú desplegable */}
                <Menu
                    id='menuDesplegable'
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={() => navigate('/configuracion')}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Configuración
                    </MenuItem>
                    <MenuItem id="logout" onClick={handleLogout}>
                        
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Cerrar sesión
                    </MenuItem>
                </Menu>
            </Box>
            

            {/* Contenido */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto'
                }}
            >
        {/* Contenido principal */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            {/* Saludo */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }} color='black'>
                    Hola, {usuario?.nombre || 'Invitado'}
                </Typography>
            {/* Calendario de Google */}
                    <Paper sx={{ borderRadius: 3, border: '2px solid #d1d1d1', mb: 3, bgcolor: 'white' }}>
                        <Box sx={{ bgcolor: '#e53935', p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'white' }}>
                                Calendario:
                            </Typography>
                        </Box>

                        <Box sx={{ p: 2, minHeight: { xs: '400px', sm: '600px' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!isGapiLoaded ? (
                                <CircularProgress />
                            ) : usuarioEmail ? (
                                <iframe
                                    src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(usuarioEmail)}&ctz=Europe/Madrid&mode=MONTH`}
                                    style={{ border: 0, width: '100%', height: '100%', minHeight: 'inherit' }}
                                    frameBorder="0"
                                    scrolling="no"
                                    title="Google Calendar"
                                />
                            ) : (
                                <Box textAlign="center">
                                    <Typography sx={{ mb: 2 }}>
                                        Para ver el calendario de eventos, por favor inicia sesión con tu cuenta de Google.
                                    </Typography>
                                    <Button variant="contained" onClick={handleGoogleSignInButtonClick}>
                                        Iniciar sesión con Google
                                    </Button>
                                    {gapiError && <Typography color="error" sx={{ mt: 2 }}>{gapiError}</Typography>}
                                </Box>
                            )}
                        </Box>
                    </Paper>


                    {/* Botón Mis Puertas */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Button
                            id='misPuertas'
                            variant="contained"
                            color="primary"
                            onClick={handleVerPropiedades}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'medium',
                                py: 1.5,
                                px: 5,
                                mr: 2
                            }}
                        >
                            Gestionar Puertas
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleVerAccesos}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'medium',
                                py: 1.5,
                                px: 5
                            }}
                        >
                            Accesos
                        </Button>
                    </Box>

                {/* Lista de propiedades */}
                <Typography variant="h6" fontWeight="bold" mb={2} color='black'>
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
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => window.location.reload()}
                        >
                            Reintentar
                        </Button>
                    </Paper>
                ) : propiedades.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography>No tienes propiedades registradas</Typography>
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
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {propiedad.nombre}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {propiedad.direccion}
                                </Typography>
                                <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                                    <KeyIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                    {propiedad.numeroCerraduras}{' '}
                                    {propiedad.numeroCerraduras === 1 ? 'cerradura' : 'cerraduras'}
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
            
        </Box>
    );
};

export default PropietarioDashboard;