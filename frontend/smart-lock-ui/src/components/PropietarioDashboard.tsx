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
}

const PropietarioDashboard = () => {
    const navigate = useNavigate();
    const [propiedades, setPropiedades] = useState<Propiedad[]>([
       // { id: 1, nombre: 'casa Madrid', direccion: 'Calle de santa Engracia 108, 5B' },
        //{ id: 2, nombre: 'casa Valladolid', direccion: 'Calle Torrecilla 13, 1E' },
        //{ id: 3, nombre: 'casa Mallorca', direccion: 'Carrer de Sant Alonso 7A' }
    ]);

    const [notificaciones, setNotificaciones] = useState<number>(1);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Simular recuperación de propiedades desde el backend
    useEffect(() => {
        const fetchPropiedades = async () => {
            if (!usuario.id) {
                console.error('No hay ID de usuario en localStorage');
                return;
            }
    
            try {
                const response = await fetch(`http://localhost:8080/api/propiedades/propietario/${usuario.id}`);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
    
                const data: Propiedad[] = await response.json();
                setPropiedades(data);
            } catch (error) {
                console.error('Error al obtener propiedades:', error);
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
                    width: '100%',
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
                            <Button variant="contained" onClick={handleVerPropiedades} sx={{ bgcolor: '#0d6efd', color: 'white', borderRadius: 2, textTransform: 'none' }}>Mis puertas</Button>

                        </Paper>
                    </Grid>
                </Grid>

                {/* Lista de propiedades */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
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
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                    {propiedad.nombre}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {propiedad.direccion}
                                </Typography>
                            </Box>
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