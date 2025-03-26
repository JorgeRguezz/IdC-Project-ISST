import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, IconButton, Button, CircularProgress, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface PropiedadDetalle {
    id: number;
    nombre: string;
    direccion: string;
}

// Estados posibles para la vista de apertura
type EstadoApertura = 'inicial' | 'conectando' | 'error' | 'tokenForm' | 'exito';

const AbrirPuerta = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { propiedadId } = useParams();
    const [propiedad, setPropiedad] = useState<PropiedadDetalle | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [estado, setEstado] = useState<EstadoApertura>('inicial');
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

    // Recuperar los datos de la propiedad desde location.state o hacer una llamada a la API
    useEffect(() => {
        if (location.state?.propiedad) {
            setPropiedad(location.state.propiedad);
        } else if (propiedadId) {
            // Aquí se haría una llamada a la API para obtener los detalles de la propiedad
            // En este ejemplo, simularemos la respuesta
            setIsLoading(true);
            // Simulación de llamada a API
            setTimeout(() => {
                const propiedadEjemplo: PropiedadDetalle = {
                    id: parseInt(propiedadId),
                    nombre: `Propiedad ${propiedadId}`,
                    direccion: 'Martini van Geffenstraat 25, Amsterdam'
                };
                setPropiedad(propiedadEjemplo);
                setIsLoading(false);
            }, 800);
        }
    }, [propiedadId, location.state]);

    const handleVolver = () => {
        // Si estamos en la pantalla de éxito, volvemos al dashboard
        if (estado === 'exito') {
            irAlDashboard();
            return;
        }

        // Si estamos en cualquier otro estado, mostramos un diálogo de confirmación
        // En una implementación real, esto podría ser un diálogo de confirmación
        const confirmar = window.confirm("¿Estás seguro de que deseas cancelar la apertura de la puerta?");
        if (confirmar) {
            irAlDashboard();
        }
    };

    const irAlDashboard = () => {
        // Determinar a qué dashboard regresar según el tipo de usuario
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.tipo === 'propietario') {
            navigate('/propietario-dashboard');
        } else {
            navigate('/huesped-dashboard');
        }
    };

    const handleCerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleAbrirPuerta = () => {
        setEstado('conectando');
        setError('');

        // Simulación de apertura de puerta con Bluetooth
        setTimeout(() => {
            // Simulamos una probabilidad de éxito/error para mostrar el comportamiento
            const exito = Math.random() > 0.7; // 30% de probabilidad de error

            if (exito) {
                // Si la apertura es exitosa, mostrar la vista de éxito
                setEstado('exito');
            } else {
                // Si hay un error en la apertura
                setError('No se pudo conectar con la cerradura. Por favor, reintenta o usa un token de acceso.');
                setEstado('error');
            }
        }, 2000);
    };

    const handleReintentar = () => {
        // Volver al estado inicial para reintentar
        setEstado('inicial');
        setError('');
    };

    const handleAbrirTokenDialog = () => {
        setTokenDialogOpen(true);
    };

    const handleCerrarTokenDialog = () => {
        setTokenDialogOpen(false);
    };

    const handleUsarToken = () => {
        if (!token.trim()) {
            setError('Por favor, introduce un token válido.');
            return;
        }

        setTokenDialogOpen(false);
        setEstado('conectando');
        setError('');

        // Simulación de verificación de token
        setTimeout(() => {
            // En una app real, aquí verificaríamos el token con el backend
            // Simulamos un 80% de probabilidad de que el token sea válido
            const tokenValido = Math.random() > 0.2 || token === '1234'; // Token de prueba siempre válido

            if (tokenValido) {
                setEstado('exito');
            } else {
                setError('Token inválido o expirado. Por favor, verifica e intenta de nuevo.');
                setEstado('error');
            }
        }, 1500);
    };

    // Mientras carga los datos de la propiedad
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100%',
                    bgcolor: '#ebf5ff',
                    m: 0,
                    p: 0
                }}
            >
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Cargando detalles de la propiedad...</Typography>
            </Box>
        );
    }

    // Si no se encuentra la propiedad
    if (!propiedad && !isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100%',
                    bgcolor: '#ebf5ff',
                    m: 0,
                    p: 2
                }}
            >
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: '#f5f9ff', width: '100%', maxWidth: 400 }}>
                    <Typography variant="h6" color="error" align="center">
                        Propiedad no encontrada
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={irAlDashboard}
                        sx={{ mt: 3 }}
                    >
                        Volver al Inicio
                    </Button>
                </Paper>
            </Box>
        );
    }

    // Vista de éxito después de abrir la puerta
    if (estado === 'exito') {
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
                        <IconButton color="primary" onClick={handleVolver}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold', color: '#0d6efd' }}>
                            Volver
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

                {/* Contenido de éxito */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            borderRadius: 2,
                            width: '100%',
                            maxWidth: 320,
                            bgcolor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <img
                            src="/lock-success-icon.svg"
                            alt="Candado abierto"
                            style={{ width: 120, height: 120, marginBottom: 16 }}
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                color: '#0d6efd',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                mb: 3
                            }}
                        >
                            Puerta abierta con éxito
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={irAlDashboard}
                            sx={{
                                borderRadius: 28,
                                py: 1,
                                px: 4,
                                textTransform: 'none',
                                fontSize: '1rem',
                            }}
                        >
                            Aceptar
                        </Button>
                    </Paper>
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
                    <IconButton color="primary" onClick={handleVolver}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold', color: '#0d6efd' }}>
                        Volver
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

            {/* Título de la propiedad */}
            <Typography
                variant="h6"
                component="h1"
                sx={{
                    my: 3,
                    px: 2,
                    textAlign: 'center',
                    fontWeight: 'medium',
                    color: '#333'
                }}
            >
                {propiedad?.direccion}
            </Typography>

            {/* Contenido principal */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1,
                    px: 2,
                    pb: 4
                }}
            >
                {/* Botón de Bluetooth o mensaje de error */}
                {estado === 'inicial' && (
                    <>
                        <Box
                            sx={{
                                width: 180,
                                height: 180,
                                borderRadius: '50%',
                                bgcolor: '#e3f2fd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 20px rgba(13, 110, 253, 0.25)',
                                mb: 3,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                },
                                '&:active': {
                                    transform: 'scale(0.95)'
                                }
                            }}
                            onClick={handleAbrirPuerta}
                        >
                            <img
                                src="/bluetooth-icon.svg"
                                alt="Bluetooth"
                                style={{ width: '80%', height: '80%' }}
                            />
                        </Box>

                        <Typography
                            variant="h5"
                            sx={{
                                mb: 1,
                                color: '#0d6efd',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Abrir puerta
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                textAlign: 'center'
                            }}
                        >
                            Pulse el botón para abrir la puerta
                        </Typography>

                        <Button
                            variant="text"
                            color="primary"
                            onClick={handleAbrirTokenDialog}
                            sx={{
                                mt: 3,
                                textTransform: 'none',
                                fontWeight: 'medium'
                            }}
                        >
                            Usar token de acceso
                        </Button>
                    </>
                )}

                {estado === 'conectando' && (
                    <>
                        <Box
                            sx={{
                                width: 180,
                                height: 180,
                                borderRadius: '50%',
                                bgcolor: '#e3f2fd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 20px rgba(13, 110, 253, 0.25)',
                                mb: 3
                            }}
                        >
                            <CircularProgress size={70} sx={{ color: '#0d6efd' }} />
                        </Box>

                        <Typography
                            variant="h5"
                            sx={{
                                mb: 1,
                                color: '#0d6efd',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Conectando...
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                textAlign: 'center',
                                px: 2
                            }}
                        >
                            Estableciendo conexión con la cerradura...
                        </Typography>
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 320,
                                p: 3,
                                borderRadius: 2,
                                bgcolor: '#fee',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 3
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#d32f2f',
                                    textAlign: 'center',
                                    mb: 3
                                }}
                            >
                                {error}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleReintentar}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Reintentar
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAbrirTokenDialog}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Usar token
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>

            {/* Diálogo para ingresar token */}
            <Dialog
                open={tokenDialogOpen}
                onClose={handleCerrarTokenDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Introduce tu token de acceso</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ingresa el token que te ha proporcionado el propietario para acceder a esta propiedad.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="token"
                        label="Token de acceso"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCerrarTokenDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleUsarToken} color="primary" variant="contained">
                        Verificar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AbrirPuerta; 