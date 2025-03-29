import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Grid, Button, Badge } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ClockIcon from '@mui/icons-material/AccessTime';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';

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

    const handleGestionarAcceso = (propiedad: Propiedad) => {
        // Navegar a la vista de gestion de acceso, pasando los datos de la propiedad
        navigate('/propiedades/gestionar-acceso', { state: { propiedad } });
    };

    const handleAbrirPuerta = (propiedad: Propiedad) => {
        // Navegar a la vista de apertura de puerta, pasando los datos de la propiedad
        navigate(`/abrir-puerta/${propiedad.id}`, { state: { propiedad } });
    };

    // Función para generar fechas del calendario
    const generarCalendario = () => {
        const hoy = new Date();
        const mes = hoy.getMonth();
        const año = hoy.getFullYear();
        const diasEnMes = new Date(año, mes + 1, 0).getDate();

        const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const primerDia = new Date(año, mes, 1).getDay();

        // Días del mes anterior para completar la primera semana
        const diasPrevios = [];
        for (let i = 0; i < primerDia; i++) {
            diasPrevios.push(<Box key={`prev-${i}`} sx={{ width: 24, height: 24, m: 0.5, color: '#ccc' }}></Box>);
        }

        // Días del mes actual
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

    const { diasSemana, diasPrevios, dias } = generarCalendario();

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
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/home-bluetooth.svg"
                        alt="Logo"
                        style={{ height: 30, marginRight: 10 }}
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

            {/* Contenido principal */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    overflowY: 'auto'
                }}
            >
                {/* Calendario y Mis puertas */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: '#e3f2fd'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Julio de 2025
                            </Typography>

                            {/* Días de la semana */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                {diasSemana.map((dia, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            m: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            color: '#666'
                                        }}
                                    >
                                        {dia}
                                    </Box>
                                ))}

                                {/* Espacios en blanco para los días previos */}
                                {diasPrevios}

                                {/* Días del mes */}
                                {dias}
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: '#e3f2fd',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}
                        >
                            <Box sx={{ mb: 1 }}>
                                <img
                                    src="/door-icon.svg"
                                    alt="Puerta"
                                    style={{ width: 60, height: 60 }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleVerPropiedades}
                                sx={{
                                    bgcolor: '#0d6efd',
                                    color: 'white',
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }}
                            >
                                Mis puertas
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Lista de propiedades */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {cargando && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: '#e3f2fd',
                                textAlign: 'center'
                            }}
                        >
                            <Typography>Cargando propiedades...</Typography>
                        </Paper>
                    )}

                    {error && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: '#ffebee',
                                textAlign: 'center'
                            }}
                        >
                            <Typography color="error">Error: {error}</Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                sx={{ mt: 1 }}
                                onClick={() => window.location.reload()}
                            >
                                Reintentar
                            </Button>
                        </Paper>
                    )}

                    {!cargando && !error && propiedades.length === 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: '#e3f2fd',
                                textAlign: 'center'
                            }}
                        >
                            <Typography>No tienes propiedades registradas</Typography>
                        </Paper>
                    )}

                    {propiedades.map((propiedad) => (
                        <Paper
                            key={propiedad.id}
                            elevation={0}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: '#e3f2fd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
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
                                    {propiedad.numeroCerraduras} {propiedad.numeroCerraduras === 1 ? 'cerradura' : 'cerraduras'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<KeyIcon />}
                                    onClick={() => handleAbrirPuerta(propiedad)}
                                    sx={{
                                        borderRadius: 1,
                                        textTransform: 'none'
                                        }}
                                        >
                                    Abrir puerta
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<KeyIcon />}
                                    onClick={() => handleGestionarAcceso(propiedad)}
                                    sx={{
                                    borderRadius: 1,
                                    textTransform: 'none'
                                    }}
                                    >
                                    Gestionar Acceso
                                </Button>

                            </Box>
                        </Paper>
                         ))}
                        </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 2,
                    px: 4,
                    borderTop: '1px solid #eee',
                    bgcolor: 'white'
                    }}
                 >
                <IconButton>
                    <ClockIcon />
                </IconButton>
                <IconButton>
                    <Badge badgeContent={notificaciones} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <IconButton>
                    <SearchIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default PropietarioDashboard; 