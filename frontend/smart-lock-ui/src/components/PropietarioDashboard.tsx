import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Grid, Button, Badge } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ClockIcon from '@mui/icons-material/AccessTime';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';
import { CircularProgress } from '@mui/material';
import homeBluetooth from '../assets/home-bluetooth.png';


interface Propiedad {
    id: number;
    nombre: string;
    direccion: string;
    propietarioId: number;
    numeroCerraduras: number;
}

const PropietarioDashboard = () => {
    const navigate = useNavigate();
    const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [notificaciones, setNotificaciones] = useState<number>(1);
    const hoy = new Date();
    const mes = hoy.getMonth();
    const año = hoy.getFullYear();
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Recuperación de propiedades desde el backend
    useEffect(() => {
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
                const response = await fetch(`http://localhost:8080/api/propiedades/propietario/${usuario.id}`);
                console.log('Respuesta recibida, status:', response.status);

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
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

    const handleCerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
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

    // Función para generar fechas del calendario
    const generarCalendario = () => {
        const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const diasPrevios = [];
        for (let i = 0; i < primerDia; i++) {
            diasPrevios.push(
                <Box key={`prev-${i}`} sx={{ width: 24, height: 24, m: 0.5, color: '#ccc' }}></Box>
            );
        }

        const dias = [];
        for (let i = 1; i <= diasEnMes; i++) {
            dias.push(
                <Box
                    key={i}
                    sx={{
                        width: 24,
                        height: 24,
                        m: 0.5,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: i === hoy.getDate() ? '#0d6efd' : 'transparent',
                        color: i === hoy.getDate() ? 'white' : 'inherit'
                    }}
                >
                    {i}
                </Box>
            );
        }

        return { diasSemana, diasPrevios, dias };
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="primary" sx={{ mr: 1 }}>
                        <SettingsIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={handleCerrarSesion}>
                        <LogoutIcon />
                    </IconButton>
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
                {/* Calendario */}
                <Paper
                    sx={{
                        borderRadius: 3,
                        border: '2px solid #d1d1d1',
                        bgcolor: '#ffffff',
                        overflow: 'hidden',
                        mb: 3
                    }}
                >
                    <Box sx={{ bgcolor: '#e53935', p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
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
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((dia, index) => (
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, p: 1 }}>
                        {[...Array(primerDia)].map((_, i) => (
                            <Box key={`empty-${i}`} />
                        ))}
                        {[...Array(diasEnMes)].map((_, i) => {
                            const dia = i + 1;
                            const esHoy = dia === new Date().getDate();
                            return (
                                <Box
                                    key={dia}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: esHoy ? '#0d6efd' : 'transparent',
                                        color: esHoy ? 'white' : '#212121',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            cursor: 'pointer',
                                            bgcolor: esHoy ? '#0b5ed7' : '#e3f2fd'
                                        }
                                    }}
                                >
                                    {dia}
                                </Box>
                            );
                        })}
                    </Box>
                </Paper>

                {/* Botón Mis Puertas */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Button
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
                    Tus propiedades
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
    );
};

export default PropietarioDashboard;