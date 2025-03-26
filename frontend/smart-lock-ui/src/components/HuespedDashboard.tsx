import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, IconButton, Grid, Button, Badge } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import KeyIcon from '@mui/icons-material/Key';
import HomeIcon from '@mui/icons-material/Home';

interface Alojamiento {
    id: number;
    nombre: string;
    direccion: string;
}

const HuespedDashboard = () => {
    const navigate = useNavigate();
    const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([
        { id: 1, nombre: 'Mi casa', direccion: 'Calle José Abascal 45, 3B' },
        { id: 2, nombre: 'Apartamento en Amsterdam', direccion: 'Martini van Geffenstraat 25' }
    ]);

    const [notificaciones, setNotificaciones] = useState<number>(1);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Simular recuperación de alojamientos desde el backend
    useEffect(() => {
        // Aquí se haría una llamada a la API real
        // const fetchAlojamientos = async () => {
        //   try {
        //     const response = await fetch(`/api/huespedes/${usuario.id}/alojamientos`);
        //     const data = await response.json();
        //     setAlojamientos(data);
        //   } catch (error) {
        //     console.error('Error al obtener alojamientos:', error);
        //   }
        // };
        // fetchAlojamientos();
    }, [usuario.id]);

    const handleCerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleAbrirPuerta = (alojamientoId: number) => {
        console.log(`Abriendo puerta del alojamiento ${alojamientoId}`);
        // Aquí se haría una llamada a la API para abrir la puerta
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
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                py: 2,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: '#ebf5ff'
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'medium',
                                color: '#0d6efd'
                            }}
                        >
                            Mis puertas
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Lista de alojamientos */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {alojamientos.map((alojamiento) => (
                    <Paper
                        key={alojamiento.id}
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
                                {alojamiento.nombre}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {alojamiento.direccion}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<KeyIcon />}
                            onClick={() => handleAbrirPuerta(alojamiento.id)}
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

            {/* Footer */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 2,
                    borderTop: '1px solid #eee'
                }}
            >
                <IconButton>
                    <HomeIcon />
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
        </Container>
    );
};

export default HuespedDashboard; 