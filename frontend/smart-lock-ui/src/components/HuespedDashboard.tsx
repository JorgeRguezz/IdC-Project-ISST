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
    propietario: string;
    fechaInicio: string;
    fechaFin: string;
}

const HuespedDashboard = () => {
    const navigate = useNavigate();
    const [propiedades, setPropiedades] = useState<Propiedad[]>([
        {
            id: 1,
            nombre: 'Casa Madrid',
            direccion: 'Calle de Santa Engracia 108, 5B',
            propietario: 'Ana Martínez',
            fechaInicio: '2023-07-01',
            fechaFin: '2023-07-15'
        },
    ]);

    const [notificaciones, setNotificaciones] = useState<number>(0);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Simular recuperación de propiedades desde el backend
    useEffect(() => {
        // Aquí se haría una llamada a la API real
        // const fetchPropiedades = async () => {
        //   try {
        //     const response = await fetch(`/api/huespedes/${usuario.id}/invitaciones`);
        //     const data = await response.json();
        //     setPropiedades(data);
        //   } catch (error) {
        //     console.error('Error al obtener propiedades:', error);
        //   }
        // };
        // fetchPropiedades();
    }, [usuario.id]);

    const handleCerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleAbrirPuerta = (propiedad: Propiedad) => {
        // Navegar a la vista de apertura de puerta, pasando los datos de la propiedad
        navigate(`/abrir-puerta/${propiedad.id}`, { state: { propiedad } });
    };

    // Función para verificar si el acceso a una propiedad está activo
    const esAccesoActivo = (inicio: string, fin: string) => {
        const hoy = new Date();
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);
        return hoy >= fechaInicio && hoy <= fechaFin;
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
                        Inicio Huésped
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
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Tus accesos
                </Typography>

                {/* Banner informativo */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: '#fff8db',
                        border: '1px solid #fff2a8'
                    }}
                >
                    <Typography variant="body2">
                        Solo podrás abrir las puertas durante las fechas activas de tu invitación. Si necesitas más tiempo,
                        contacta con el propietario.
                    </Typography>
                </Paper>

                {/* Lista de propiedades */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {propiedades.map((propiedad) => {
                        const activo = esAccesoActivo(propiedad.fechaInicio, propiedad.fechaFin);
                        return (
                            <Paper
                                key={propiedad.id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    bgcolor: activo ? '#e3f2fd' : '#f5f5f5',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                            {propiedad.nombre}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                                            {propiedad.direccion}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            Propietario: {propiedad.propietario}
                                        </Typography>
                                    </Box>
                                    {activo && (
                                        <Box
                                            sx={{
                                                bgcolor: '#4caf50',
                                                color: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Activo
                                        </Box>
                                    )}
                                    {!activo && (
                                        <Box
                                            sx={{
                                                bgcolor: '#bdbdbd',
                                                color: 'white',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Inactivo
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Desde: {new Date(propiedad.fechaInicio).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Hasta: {new Date(propiedad.fechaFin).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<KeyIcon />}
                                    onClick={() => handleAbrirPuerta(propiedad)}
                                    disabled={!activo}
                                    sx={{
                                        borderRadius: 1,
                                        textTransform: 'none',
                                        alignSelf: 'flex-end'
                                    }}
                                >
                                    Abrir puerta
                                </Button>
                            </Paper>
                        );
                    })}
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

export default HuespedDashboard; 