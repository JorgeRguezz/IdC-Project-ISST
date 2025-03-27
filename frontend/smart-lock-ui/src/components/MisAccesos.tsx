import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import { useNavigate } from 'react-router-dom';

interface Acceso {
    id: number;
    cerraduraId: number;
    cerraduraNombre: string;
    direccion: string;
    propietario: string;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
}

const MisAccesos = () => {
    const navigate = useNavigate();
    const [accesos, setAccesos] = useState<Acceso[]>([
        {
            id: 1,
            cerraduraId: 1,
            cerraduraNombre: 'Mi casa',
            direccion: 'Calle José Abascal 45, 3B',
            propietario: 'Ana Martínez',
            fechaInicio: '2023-07-01',
            fechaFin: '2023-12-31',
            activo: true
        },
        {
            id: 2,
            cerraduraId: 2,
            cerraduraNombre: 'Apartamento en Amsterdam',
            direccion: 'Martini van Geffenstraat 25',
            propietario: 'Carlos Ruiz',
            fechaInicio: '2023-06-15',
            fechaFin: '2023-08-30',
            activo: true
        },
        {
            id: 3,
            cerraduraId: 3,
            cerraduraNombre: 'Oficina Madrid',
            direccion: 'Gran Vía 32, 4ª planta',
            propietario: 'Empresa XYZ',
            fechaInicio: '2023-01-01',
            fechaFin: '2023-01-15',
            activo: false
        }
    ]);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Recuperación de accesos desde el backend
    useEffect(() => {
        // En una aplicación real, aquí se obtendrían los accesos del huésped
        // const fetchAccesos = async () => {
        //   try {
        //     const response = await fetch(`http://localhost:8080/api/huespedes/${usuario.id}/accesos`);
        //     if (response.ok) {
        //       const data = await response.json();
        //       setAccesos(data);
        //     }
        //   } catch (error) {
        //     console.error('Error al obtener accesos:', error);
        //   }
        // };
        // fetchAccesos();
    }, [usuario.id]);

    const handleVolver = () => {
        navigate('/huesped-dashboard');
    };

    // Función para verificar si un acceso está activo
    const esAccesoActivo = (inicio: string, fin: string) => {
        const hoy = new Date();
        const fechaInicio = new Date(inicio);
        const fechaFin = new Date(fin);
        return hoy >= fechaInicio && hoy <= fechaFin;
    };

    // Función para dar formato a las fechas
    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    bgcolor: '#ebf5ff'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="primary" onClick={handleVolver} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd' }}>
                        Mis Accesos
                    </Typography>
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
                {/* Mensaje informativo */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Aquí puedes ver todos tus accesos a cerraduras. Los accesos activos te permiten abrir
                        las puertas correspondientes durante el período indicado.
                    </Typography>
                </Paper>

                {/* Lista de accesos */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {accesos.length === 0 ? (
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
                            <Typography variant="body1">No tienes accesos registrados</Typography>
                        </Paper>
                    ) : (
                        accesos.map((acceso) => {
                            const activo = esAccesoActivo(acceso.fechaInicio, acceso.fechaFin);
                            return (
                                <Paper
                                    key={acceso.id}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        borderRadius: 2,
                                        bgcolor: 'white',
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DoorFrontIcon sx={{ color: '#0d6efd', mr: 1 }} />
                                            <Box>
                                                <Typography variant="h6">{acceso.cerraduraNombre}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {acceso.direccion}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={activo ? "Activo" : "Inactivo"}
                                            color={activo ? "success" : "default"}
                                            size="small"
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <AccessTimeIcon sx={{ color: '#666', fontSize: 18, mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            Desde: {formatearFecha(acceso.fechaInicio)} - Hasta: {formatearFecha(acceso.fechaFin)}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Propietario: {acceso.propietario}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            disabled={!activo}
                                            onClick={() => navigate(`/abrir-puerta/${acceso.cerraduraId}`)}
                                            sx={{ borderRadius: 1, textTransform: 'none' }}
                                        >
                                            Ir a abrir puerta
                                        </Button>
                                    </Box>
                                </Paper>
                            );
                        })
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default MisAccesos; 