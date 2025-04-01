import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton, Avatar, Badge, Divider, CircularProgress } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import homeBluetooth from '../assets/home-bluetooth.png';

interface Cerradura {
    id: number;
    nombre: string;
}

const HuespedDashboard = () => {
    console.log('Renderizando HuespedDashboard');

    const navigate = useNavigate();
    const [cerraduras, setCerraduras] = useState<Cerradura[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [notificaciones, setNotificaciones] = useState(2); // Número de notificaciones para mostrar

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : {};

    // Ya no usamos datos de prueba para mostrar cuando no hay datos del backend
    // Esto asegura que se muestre correctamente el mensaje "No tienes accesos asignados"
    // cuando el usuario realmente no tiene accesos

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
                const url = `http://localhost:8080/api/huespedes/${id}/cerraduras`;
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

    const handleLogout = () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
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

    // Generación del calendario
    const generarCalendario = () => {
        const hoy = new Date();
        const mes = hoy.getMonth();
        const año = hoy.getFullYear();
        const diasEnMes = new Date(año, mes + 1, 0).getDate();
        const primerDia = new Date(año, mes, 1).getDay();

        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

        // Ajuste para que la semana comience en lunes
        const primerDiaAjustado = primerDia === 0 ? 6 : primerDia - 1;

        return (
            <Box
                sx={{
                    mt: 2,
                    borderRadius: 3,
                    border: '2px solid #d1d1d1',
                    overflow: 'hidden',
                    bgcolor: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}
            >
                {/* Cabecera estilo emoji */}
                <Box
                    sx={{
                        bgcolor: '#e53935',
                        p: 1.5,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {meses[mes]} {año}
                    </Typography>
                </Box>

                {/* Días de la semana */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 1,
                        p: 1,
                        bgcolor: '#fafafa',
                        borderBottom: '1px solid #eee'
                    }}
                >
                    {diasSemana.map((dia, index) => (
                        <Typography
                            key={index}
                            sx={{
                                textAlign: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: '#616161'
                            }}
                        >
                            {dia}
                        </Typography>
                    ))}
                </Box>

                {/* Días del mes */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 1,
                        p: 1
                    }}
                >
                    {Array.from({ length: primerDiaAjustado }).map((_, i) => (
                        <Box key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: diasEnMes }).map((_, i) => {
                        const diaActual = i + 1;
                        const esHoy = diaActual === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();

                        return (
                            <Box
                                key={diaActual}
                                onClick={() => alert(`Has hecho clic en el día ${diaActual}`)}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    borderRadius: 1,
                                    margin: '0 auto',
                                    cursor: 'pointer',
                                    bgcolor: esHoy ? '#0d6efd' : 'transparent',
                                    color: esHoy ? 'white' : '#212121',
                                    border: esHoy ? 'none' : '1px solid transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: esHoy ? '#0b5ed7' : '#e3f2fd',
                                        border: '1px solid #90caf9'
                                    }
                                }}
                            >
                                {diaActual}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    }

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
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            ml: 1,
                            bgcolor: '#0d6efd',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        {usuario?.nombre?.charAt(0) || 'U'}
                    </Avatar>
                </Box>
            </Box>

            {/* Contenido */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    overflowY: 'auto'
                }}
            >
                {/* Saludo */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }} color='black'>
                    Hola, {usuario?.nombre || 'Invitado'}
                </Typography>

                {/* Calendario */}
                <Paper elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
                    {generarCalendario()}
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

                {/* Cerrar sesión */}
                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'medium' }}
                    >
                        Cerrar sesión
                    </Button>
                </Box>
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