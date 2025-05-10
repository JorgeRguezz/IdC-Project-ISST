import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, Avatar, Badge, CircularProgress, Menu, MenuItem, ListItemIcon } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import homeBluetooth from '../assets/home-bluetooth.png';
import { gapi } from 'gapi-script';

interface Cerradura {
    id: number;
    nombre: string;
}

const CLIENT_ID = '378065249483-h4lad2d3m51n5ag1m0e9he8j5c43tj9u.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const CALENDAR_ID = '3879af64c7bdf344b6c989d6b6bab60e8d2c4701302e694291789c8fe7d04898@group.calendar.google.com';


const HuespedDashboard = () => {
    console.log('Renderizando HuespedDashboard');

    const navigate = useNavigate();
    const [cerraduras, setCerraduras] = useState<Cerradura[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [notificaciones, setNotificaciones] = useState(2); // Número de notificaciones para mostrar
    const [usuarioEmail, setUsuarioEmail] = useState<string | null>(null);
    const [isGapiLoaded, setIsGapiLoaded] = useState(false); // Estado para saber si GAPI está cargado
    const [gapiError, setGapiError] = useState<string | null>(null); // Estado para manejar errores de GAPI

    // Estado para el menú desplegable
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : {};

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const [mes] = useState(new Date().getMonth());
    const [año] = useState(new Date().getFullYear());

    console.log('Usuario cargado:', usuario);

    // Recuperación de cerraduras desde el backend
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

    // useEffect(() => {
    //     gapi.load('client:auth2', () => {
    //         gapi.client
    //             .init({ clientId: CLIENT_ID, scope: SCOPES, discoveryDocs: DISCOVERY_DOCS })
    //             .then(() => {
    //                 const auth2 = gapi.auth2.getAuthInstance();
    //                 if (auth2.isSignedIn.get()) {
    //                     const profile = auth2.currentUser.get().getBasicProfile();
    //                     setUsuarioEmail(profile.getEmail());
    //                 }
    //             })
    //             .catch(console.error);
    //     });
    // }, []);

    // <-- MODIFICADO: useEffect para inicialización de GAPI y manejo de autenticación -->
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
                        setUsuarioEmail(null); // Asegurarse de que el email es null si no hay perfil
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
                setIsGapiLoaded(true); // Marcar como cargado para mostrar el error
            });
        };

        try {
            gapi.load('client:auth2', initClient);
        } catch (e) {
            console.error("Error al cargar gapi.load:", e);
            setGapiError('Error crítico al cargar la API de Google. Refresca la página.');
            setIsGapiLoaded(true); // Marcar como cargado para mostrar el error
        }
    }, []);

    // <-- NUEVO: Manejador para el inicio de sesión con Google -->
    const handleGoogleSignIn = () => {
        setGapiError(null); // Limpiar errores previos
        if (gapi && gapi.auth2) {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance) {
                authInstance.signIn().then((googleUser: any) => {
                    // El listener 'isSignedIn.listen' debería manejar la actualización del estado.
                    // const profile = googleUser.getBasicProfile();
                    // setUsuarioEmail(profile.getEmail());
                    console.log('Inicio de sesión con Google exitoso.');
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

    const handleLogout = () => {
        console.log('Cerrando sesión...');
        if (gapi && gapi.auth2 && gapi.auth2.getAuthInstance()) {
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                authInstance.signOut().then(() => {
                    console.log('Sesión de Google cerrada.');
                }).catch((error: any) => {
                    console.error('Error al cerrar sesión de Google:', error);
                });
            }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuarioEmail(null);
        navigate('/login');
    };

    // Función para abrir una puerta
    const handleAbrirPuerta = (cerraduraId: number) => {
        console.log('Navegando a abrir puerta:', cerraduraId);
        navigate(`/abrir-puerta/cerradura/${cerraduraId}`);
    };

    // Función para ir a la página de mis accesos
    const handleMisPuertas = () => {
        console.log('Navegando a mis accesos');
        navigate('/mis-accesos');
    };

    // Generación del calendario -----------------> NO SE USA POR EL MOMENTO, PERO PUEDE USARSE EN UN FUTURO POR SI EL USUARIO NO HA INICIADO SESIÓN CON GOOGLE <----------------------
    // const generarCalendario = () => {
    //     const hoy = new Date();
    //     const mes = hoy.getMonth();
    //     const año = hoy.getFullYear();
    //     const diasEnMes = new Date(año, mes + 1, 0).getDate();
    //     const primerDia = new Date(año, mes, 1).getDay();

    //     const meses = [
    //         'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    //         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    //     ];

    //     const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    //     // Ajuste para que la semana comience en lunes
    //     const primerDiaAjustado = primerDia === 0 ? 6 : primerDia - 1;

    //     return (
    //         <Box
    //             sx={{
    //                 mt: 2,
    //                 borderRadius: 3,
    //                 border: '2px solid #d1d1d1',
    //                 overflow: 'hidden',
    //                 bgcolor: '#ffffff',
    //                 boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
    //             }}
    //         >
    //             {/* Cabecera estilo emoji */}
    //             <Box
    //                 sx={{
    //                     bgcolor: '#e53935',
    //                     p: 1.5,
    //                     textAlign: 'center'
    //                 }}
    //             >
    //                 <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
    //                     {meses[mes]} {año}
    //                 </Typography>
    //             </Box>

    //             {/* Días de la semana */}
    //             <Box
    //                 sx={{
    //                     display: 'grid',
    //                     gridTemplateColumns: 'repeat(7, 1fr)',
    //                     gap: 1,
    //                     p: 1,
    //                     bgcolor: '#fafafa',
    //                     borderBottom: '1px solid #eee'
    //                 }}
    //             >
    //                 {diasSemana.map((dia, index) => (
    //                     <Typography
    //                         key={index}
    //                         sx={{
    //                             textAlign: 'center',
    //                             fontSize: '0.85rem',
    //                             fontWeight: 500,
    //                             color: '#616161'
    //                         }}
    //                     >
    //                         {dia}
    //                     </Typography>
    //                 ))}
    //             </Box>

    //             {/* Días del mes */}
    //             <Box
    //                 sx={{
    //                     display: 'grid',
    //                     gridTemplateColumns: 'repeat(7, 1fr)',
    //                     gap: 1,
    //                     p: 1
    //                 }}
    //             >
    //                 {Array.from({ length: primerDiaAjustado }).map((_, i) => (
    //                     <Box key={`empty-${i}`} />
    //                 ))}

    //                 {Array.from({ length: diasEnMes }).map((_, i) => {
    //                     const diaActual = i + 1;
    //                     const esHoy = diaActual === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();

    //                     return (
    //                         <Box
    //                             key={diaActual}
    //                             onClick={() => alert(`Has hecho clic en el día ${diaActual}`)}
    //                             sx={{
    //                                 width: 40,
    //                                 height: 40,
    //                                 display: 'flex',
    //                                 alignItems: 'center',
    //                                 justifyContent: 'center',
    //                                 fontWeight: 500,
    //                                 fontSize: '0.9rem',
    //                                 borderRadius: 1,
    //                                 margin: '0 auto',
    //                                 cursor: 'pointer',
    //                                 bgcolor: esHoy ? '#0d6efd' : 'transparent',
    //                                 color: esHoy ? 'white' : '#212121',
    //                                 border: esHoy ? 'none' : '1px solid transparent',
    //                                 transition: 'all 0.2s ease',
    //                                 '&:hover': {
    //                                     bgcolor: esHoy ? '#0b5ed7' : '#e3f2fd',
    //                                     border: '1px solid #90caf9'
    //                                 }
    //                             }}
    //                         >
    //                             {diaActual}
    //                         </Box>
    //                     );
    //                 })}
    //             </Box>
    //         </Box>
    //     );
    // }

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
                overflow: 'hidden'
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    zIndex: 10
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton color="primary" onClick={() => navigate('/configuracion')}>
                        <SettingsIcon />
                    </IconButton>
                    
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={handleMenuOpen}
                    >
                        <Avatar sx={{ bgcolor: '#0d6efd' }}>
                            {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Typography sx={{ ml: 1, fontWeight: 'bold', color: '#333' }}>
                            {usuario.nombre || 'Usuario'}
                        </Typography>
                    </Box>

                    {/* Menú desplegable */}
                    <Menu
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
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Cerrar sesión
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Contenido */}
            <Box
                sx={{
                    flexGrow: 1,
                    p: 3,
                    overflowY: 'auto'
                }}
            >
                {/* Saludo */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }} color='black'>
                    Hola, {usuario?.nombre || 'Invitado'}
                </Typography>

                {/* Calendario
                <Paper elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
                    {generarCalendario()}
                </Paper> */}

                  {/* Calendario de Google */}
                  <Paper sx={{ borderRadius: 3, border: '2px solid #d1d1d1', mb: 3, bgcolor: 'white' }}>
                        <Box sx={{ bgcolor: '#e53935', p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'white' }}>
                                {mes + 1} / {año}
                            </Typography>
                        </Box>
                
                        {/* <-- MODIFICADO: Lógica para mostrar calendario o botón de inicio de sesión --> */}
                        <Box sx={{ p: 2, minHeight: { xs: '400px', sm: '600px' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!isGapiLoaded ? (
                                <CircularProgress />
                            ) : usuarioEmail ? (
                                <iframe
                                    src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=Europe/Madrid&mode=MONTH`}
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
                                    <Button variant="contained" onClick={handleGoogleSignIn}>
                                        Iniciar sesión con Google
                                    </Button>
                                    {gapiError && <Typography color="error" sx={{ mt: 2 }}>{gapiError}</Typography>}
                                </Box>
                            )}
                        </Box>
                    </Paper>

                {/* Botón Mis Accesos */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMisPuertas}
                    fullWidth
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'medium',
                        py: 1.5,
                        mb: 3
                    }}
                >
                    Mis Accesos
                </Button>

                {/* Lista de Accesos Activos */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }} color='black'>
                    Accesos activos
                </Typography>

                {cargando ? (
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <CircularProgress sx={{ mb: 2, color: '#0d6efd' }} />
                        <Typography>Cargando tus accesos...</Typography>
                    </Paper>
                ) : error ? (
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: 48, mb: 2 }} />
                        <Typography variant="body1" color="error" sx={{ fontWeight: 'medium', mb: 1 }}>
                            Error al cargar tus accesos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                        <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
                            Reintentar
                        </Button>
                    </Paper>
                ) : cerraduras.length === 0 ? (
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <DoorFrontIcon sx={{ color: '#9e9e9e', fontSize: 48, mb: 2 }} />
                        <Typography variant="body1" fontWeight="medium" mb={1}>
                            No tienes accesos asignados
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Contacta con el propietario para obtener acceso.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {cerraduras.map((cerradura) => (
                            <Paper
                                key={cerradura.id}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: 'white',
                                    border: '1px solid #e0e0e0'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DoorFrontIcon sx={{ color: '#0d6efd' }} />
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {cerradura.nombre}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleAbrirPuerta(cerradura.id)}
                                    endIcon={<KeyboardArrowRightIcon />}
                                    sx={{ borderRadius: 1, textTransform: 'none' }}
                                >
                                    Abrir
                                </Button>
                            </Paper>
                        ))}
                    </Box>
                )}

                
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    py: 1.5,
                    px: 3,
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: '#ffffff'
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
}

export default HuespedDashboard;