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
                        // Si el huésped no existe en el sistema
                        console.error('Usuario no encontrado (404)');
                        throw new Error('No se encontró tu perfil de usuario en el sistema.');
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
        navigate(`/abrir-puerta/${cerraduraId}`);
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
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {meses[mes]} {año}
                </Typography>

                {/* Días de la semana */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                    {diasSemana.map((dia, index) => (
                        <Box
                            key={index}
                            sx={{
                                textAlign: 'center',
                                p: 1,
                                color: '#666',
                                fontWeight: 'bold'
                            }}
                        >
                            {dia}
                        </Box>
                    ))}
                </Box>

                {/* Días del mes */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                    {/* Espacios vacíos para ajustar el primer día */}
                    {Array.from({ length: primerDiaAjustado }).map((_, i) => (
                        <Box key={`empty-${i}`} sx={{ p: 1 }}></Box>
                    ))}

                    {/* Días del mes */}
                    {Array.from({ length: diasEnMes }).map((_, i) => {
                        const diaActual = i + 1;
                        const esDiaActual = diaActual === hoy.getDate();

                        return (
                            <Box
                                key={diaActual}
                                sx={{
                                    p: 1,
                                    textAlign: 'center',
                                    borderRadius: '50%',
                                    bgcolor: esDiaActual ? '#0d6efd' : 'transparent',
                                    color: esDiaActual ? 'white' : 'inherit',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}
                            >
                                {diaActual}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100vh',
                bgcolor: '#ebf5ff',
                m: 0,
                p: 0,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    width: '98%',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    bgcolor: '#ebf5ff'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd' }}>
                        IOH
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton>
                        <SettingsIcon />
                    </IconButton>
                    <IconButton>
                        <Badge badgeContent={notificaciones} color="primary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <IconButton>
                        <SearchIcon />
                    </IconButton>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            ml: 1,
                            bgcolor: '#0d6efd',
                            cursor: 'pointer'
                        }}
                    >
                        {usuario?.nombre?.charAt(0) || 'U'}
                    </Avatar>
                </Box>
            </Box>

            {/* Contenido principal */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    overflowY: 'auto',
                    bgcolor: '#ebf5ff'
                }}
            >
                {/* Saludo */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Hola, {usuario?.nombre || 'Invitado'}
                </Typography>

                {/* Calendario */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0',
                        mb: 2
                    }}
                >
                    {generarCalendario()}
                </Paper>

                {/* Botón de Mis Puertas */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleMisPuertas}
                        sx={{
                            width: '100%',
                            borderRadius: 1,
                            textTransform: 'none',
                            py: 1.5
                        }}
                    >
                        Mis Puertas
                    </Button>
                </Box>

                {/* Lista de cerraduras */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Puertas
                </Typography>

                {cargando ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            textAlign: 'center'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <CircularProgress size={40} sx={{ mb: 2, color: '#0d6efd' }} />
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Cargando tus accesos...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Esto tomará solo unos segundos
                            </Typography>
                        </Box>
                    </Paper>
                ) : error ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: 48, mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium', color: 'error.main' }}>
                                Error al cargar tus accesos
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                {error}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => window.location.reload()}
                                sx={{ borderRadius: 1, textTransform: 'none' }}
                            >
                                Intentar nuevamente
                            </Button>
                        </Box>
                    </Paper>
                ) : cerraduras.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            textAlign: 'center'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                            <DoorFrontIcon sx={{ color: '#9e9e9e', fontSize: 48, mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                                No tienes accesos asignados
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Por ahora no tienes ningún acceso activo a cerraduras.
                                Contacta con el propietario para obtener acceso.
                            </Typography>
                        </Box>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {cerraduras.map((cerradura) => (
                            <Paper
                                key={cerradura.id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'white',
                                    border: '1px solid #e0e0e0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <DoorFrontIcon sx={{ color: '#0d6efd', mr: 2 }} />
                                    <Typography variant="subtitle1">{cerradura.nombre}</Typography>
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

                {/* Botón de cerrar sesión */}
                <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        fullWidth
                        sx={{ borderRadius: 1, textTransform: 'none' }}
                    >
                        Cerrar Sesión
                    </Button>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 4,
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    bgcolor: 'white'
                }}
            >
                <IconButton color="primary">
                    <SettingsIcon />
                </IconButton>
                <IconButton color="primary">
                    <Badge badgeContent={notificaciones} color="primary">
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