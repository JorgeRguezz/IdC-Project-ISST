import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, IconButton, Button, CircularProgress, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface PropiedadDetalle {
    id: number;
    nombre: string;
    direccion: string;
}

interface CerraduraDetalle {
    id: number;
    nombre: string;
    propiedad?: PropiedadDetalle;
}

// Estados posibles para la vista de apertura
type EstadoApertura = 'inicial' | 'conectando' | 'error' | 'tokenForm' | 'exito' | 'sin_acceso';

const AbrirPuerta = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { propiedadId, cerraduraId } = useParams<{ propiedadId?: string; cerraduraId?: string }>();
    const [propiedad, setPropiedad] = useState<PropiedadDetalle | null>(null);
    const [cerradura, setCerradura] = useState<number | null>(null);
    const [cerraduraDetalle, setCerraduraDetalle] = useState<CerraduraDetalle | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [estado, setEstado] = useState<EstadoApertura>('inicial');
    const [error, setError] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
    const [verificandoAcceso, setVerificandoAcceso] = useState(false);
    const [metodoAcceso, setMetodoAcceso] = useState<'normal' | 'token'>('normal');

    // Obtener usuario del almacenamiento local
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Recuperar los datos de la propiedad o cerradura según corresponda
    useEffect(() => {
        const fetchData = async () => {
            // Si tenemos datos de la propiedad en el state, los usamos directamente
            if (location.state?.propiedad) {
                setPropiedad(location.state.propiedad);
                return;
            }

            setIsLoading(true);

            try {
                // Caso 1: Tenemos un ID de cerradura (navegación desde HuespedDashboard o MisAccesos)
                if (cerraduraId) {
                    console.log('Obteniendo información de cerradura:', cerraduraId);

                    // Obtener información de la cerradura
                    const cerraduraResponse = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}`);
                    if (!cerraduraResponse.ok) {
                        throw new Error('No se pudo recuperar la información de la cerradura');
                    }

                    const cerraduraData = await cerraduraResponse.json();
                    setCerraduraDetalle(cerraduraData);
                    setCerradura(parseInt(cerraduraId));

                    // Obtener información de la propiedad asociada a la cerradura
                    const propiedadNombreResponse = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/propiedad/nombre`);
                    const propiedadDireccionResponse = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/propiedad/direccion`);

                    if (propiedadNombreResponse.ok && propiedadDireccionResponse.ok) {
                        const nombre = await propiedadNombreResponse.text();
                        const direccion = await propiedadDireccionResponse.text();

                        // Crear un objeto de propiedad con la información obtenida
                        const propiedadData: PropiedadDetalle = {
                            id: cerraduraData.propiedadId || 0,
                            nombre: nombre,
                            direccion: direccion
                        };

                        setPropiedad(propiedadData);

                        // Verificar acceso del usuario a la cerradura
                        verificarAccesoUsuario(parseInt(cerraduraId));
                    } else {
                        throw new Error('No se pudo recuperar la información de la propiedad');
                    }
                }
                // Caso 2: Tenemos un ID de propiedad (navegación desde PropietarioDashboard)
                else if (propiedadId) {
                    const response = await fetch(`http://localhost:8080/api/propiedades/${propiedadId}`);
                    if (!response.ok) {
                        throw new Error('No se pudo recuperar la propiedad');
                    }
                    const data: PropiedadDetalle = await response.json();
                    setPropiedad(data);
                }
                else {
                    throw new Error('No se proporcionó un ID de propiedad o cerradura');
                }
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setError(error instanceof Error ? error.message : 'Error desconocido');
                setEstado('error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [propiedadId, cerraduraId, location.state]);


    // Cuando se cargue la propiedad pero no tengamos cerradura, obtener la información de las cerraduras
    useEffect(() => {
        // Solo ejecutar si tenemos propiedad pero no cerradura (caso de navegación desde PropietarioDashboard)
        if (propiedad && !cerradura) {
            setIsLoading(true);
            fetch(`http://localhost:8080/api/cerraduras/propiedad/${propiedad.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se pudieron obtener las cerraduras');
                    }
                    return response.json();
                })
                .then(cerraduras => {
                    if (cerraduras && cerraduras.length > 0) {
                        setCerradura(cerraduras[0].id);
                        // Verificar acceso del usuario a la cerradura
                        verificarAccesoUsuario(cerraduras[0].id);
                    } else {
                        setError('Esta propiedad no tiene cerraduras registradas');
                        setEstado('error');
                    }
                })
                .catch(error => {
                    console.error('Error al obtener cerraduras:', error);
                    setError('Error al obtener cerraduras: ' + error.message);
                    setEstado('error');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [propiedad, cerradura]);

    // Verificar si el usuario tiene acceso a la cerradura
    const verificarAccesoUsuario = (cerraduraId: number) => {
        if (!usuario || !usuario.id) {
            setError('Usuario no autenticado');
            setEstado('sin_acceso');
            return;
        }

        setVerificandoAcceso(true);
        // Llamar a la API para verificar acceso
        fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/verificar-acceso?usuarioId=${usuario.id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al verificar acceso');
                }
                return response.json();
            })
            .then(tieneAcceso => {
                if (!tieneAcceso) {
                    setEstado('sin_acceso');
                    setError('No tienes acceso a esta cerradura');
                }
            })
            .catch(error => {
                console.error('Error al verificar acceso:', error);
                setEstado('sin_acceso');
                setError('Error al verificar acceso: ' + error.message);
            })
            .finally(() => {
                setVerificandoAcceso(false);
            });
    };

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

    const registrarIntentoAcceso = async (exitoso: boolean, motivo: string) => {
        try {
            await fetch('http://localhost:8080/api/registros-apertura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exitoso,
                    motivo,
                    usuario: { id: usuario.id },
                    cerradura: { id: cerradura }
                }),
            });
            console.log('Registrando intento:', {
                exitoso,
                motivo,
                usuario: { id: usuario.id },
                cerradura: { id: cerradura }
            });




        } catch (error) {
            console.error('Error al registrar intento de apertura:', error);
        }
    };


    const handleAbrirPuerta = () => {
        if (!cerradura) {
            setError('No hay cerradura disponible para abrir');
            setEstado('error');
            registrarIntentoAcceso(false, 'Cerradura no disponible');
            return;
        }

        if (!usuario || !usuario.id) {
            setError('Usuario no autenticado');
            setEstado('sin_acceso');
            registrarIntentoAcceso(false, 'Usuario no autenticado');
            return;
        }

        setEstado('conectando');
        setError('');

        fetch(`http://localhost:8080/api/cerraduras/${cerradura}/abrir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuarioId: usuario.id }),
        })
            .then(response => {
                if (!response.ok) {
                    const motivo = response.status === 403
                        ? 'Acceso denegado (sin permisos)'
                        : 'Error de apertura';

                    setEstado(response.status === 403 ? 'sin_acceso' : 'error');

                    return response.json().then(data => {
                        registrarIntentoAcceso(false, motivo);
                        throw new Error(data.error || motivo);
                    });
                }

                return response.json();
            })
            .then(data => {
                setEstado('exito');
                setMetodoAcceso('normal');
                registrarIntentoAcceso(true, 'Acceso permitido');
            })
            .catch(error => {
                console.error('Error al abrir puerta:', error);
                setError('Error al abrir puerta');
            });
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

        if (!cerradura) {
            setError('No hay cerradura disponible');
            return;
        }

        setTokenDialogOpen(false);
        setEstado('conectando');
        setError('');

        // Estrategia de validación del token
        const validarToken = async () => {
            try {
                // Primero intentamos el método estándar de la API con el usuario actual
                console.log(`Intentando validar token con usuario ${usuario.id}`);
                const response = await fetch(`http://localhost:8080/api/tokens/validar?codigo=${token}&cerraduraId=${cerradura}&usuarioId=${usuario.id}`, {
                    method: 'POST',
                });

                // Si hay éxito, retornamos la respuesta directamente
                if (response.ok) {
                    return response;
                }

                // Si el error es por falta de acceso, intentamos obtener todos los tokens
                // y validar manualmente si el token proporcionado es válido para la cerradura
                if (response.status === 403) {
                    const errorData = await response.json();
                    console.log('Error de validación estándar:', errorData.error);

                    if (errorData.error === 'No tienes acceso a esta cerradura') {
                        console.log('Intentando validación alternativa basada solo en token...');

                        // Obtenemos todos los tokens para verificar si el proporcionado es válido
                        const tokensResponse = await fetch('http://localhost:8080/api/tokens');
                        if (!tokensResponse.ok) {
                            throw new Error('No se pudo verificar el token');
                        }

                        const tokens = await tokensResponse.json();
                        const tokenObj = tokens.find((t: any) => t.codigo === token);

                        if (!tokenObj) {
                            throw new Error('Token no encontrado');
                        }

                        if (tokenObj.cerradura.id !== cerradura) {
                            throw new Error('Token no válido para esta cerradura');
                        }

                        if (tokenObj.usosMaximos > 0 && tokenObj.usosActuales >= tokenObj.usosMaximos) {
                            throw new Error('Token sin usos disponibles');

                        }
                        if (new Date(tokenObj.fechaExpiracion) < new Date()) {
                            throw new Error('Token expirado');
                        }

                        // Si el token es válido, intentamos abrir la cerradura con el ID del propietario
                        const propietarioId = tokenObj.cerradura.propiedad.propietario.id;

                        const abrirResponse = await fetch(`http://localhost:8080/api/cerraduras/${cerradura}/abrir`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ usuarioId: propietarioId }),
                        });

                        if (!abrirResponse.ok) {
                            throw new Error('Error al abrir la puerta con el token');
                        }

                        // Actualizamos manualmente el contador de usos del token
                        const updatedToken = {
                            ...tokenObj,
                            usosActuales: tokenObj.usosActuales + 1
                        };

                        try {
                            await fetch('http://localhost:8080/api/tokens', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(updatedToken),
                            });
                        } catch {
                            console.warn('No se pudo actualizar el uso del token, pero la puerta ya se abrió');
                        }

                        // Creamos una respuesta simulada para mantener consistencia con el resto del código
                        return new Response(JSON.stringify({ mensaje: 'Puerta abierta correctamente' }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }

                // Si no fue un error de falta de acceso o no pudimos resolverlo, propagamos el error original
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al validar token');
            } catch (error) {
                if (error instanceof Error) {
                    throw error; // re-lanzamos el error original con su mensaje
                } else {
                    throw new Error('Salió mal'); // por si llega algo inesperado
                }
            }


        };

        // Ejecutamos la estrategia de validación
        validarToken()
            .then(response => response.json())
            .then(() => {
                setEstado('exito');
                setMetodoAcceso('token');
            })
            .catch(error => {
                console.error('Error al validar token:', error);
                setError(error.message);
                setEstado('error');
            });
    };

    // Mientras carga los datos de la propiedad
    if (isLoading || verificandoAcceso) {
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
                <Typography sx={{ mt: 2 }}>
                    {isLoading ? 'Cargando detalles de la propiedad...' : 'Verificando acceso...'}
                </Typography>
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

    // Vista de sin acceso
    if (estado === 'sin_acceso') {
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

                {/* Contenido de error de acceso */}
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
                            src="/error-icon.svg"
                            alt="Error de acceso"
                            style={{ width: 80, height: 80, marginBottom: 16 }}
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                color: '#dc3545',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                mb: 2
                            }}
                        >
                            Acceso denegado
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                textAlign: 'center',
                                mb: 3
                            }}
                        >
                            {error || 'No tienes permiso para abrir esta puerta. Contacta con el propietario para solicitar acceso.'}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: '#0d6efd',
                                textAlign: 'center',
                                mb: 2
                            }}
                        >
                            Si tienes un token de acceso, puedes utilizarlo para abrir esta puerta.
                        </Typography>

                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleAbrirTokenDialog}
                            sx={{
                                borderRadius: 28,
                                py: 1,
                                px: 4,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                mb: 2
                            }}
                            startIcon={<LockOpenIcon />}
                        >
                            Usar token de acceso
                        </Button>

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
                            Volver al inicio
                        </Button>
                    </Paper>
                </Box>
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
                        width: '98%',
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
                            variant="h5"
                            sx={{
                                color: '#198754',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                mb: 1
                            }}
                        >
                            ¡Puerta abierta!
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                textAlign: 'center',
                                mb: 1
                            }}
                        >
                            Has abierto la puerta de {propiedad?.nombre || 'la propiedad'} correctamente.
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                                mt: 2,
                                p: 2,
                                bgcolor: metodoAcceso === 'token' ? '#e6f4ff' : '#e6ffea',
                                borderRadius: 2,
                                width: '100%'
                            }}
                        >
                            {metodoAcceso === 'token' ? (
                                <LockOpenIcon sx={{ mr: 1, color: '#0d6efd' }} />
                            ) : (
                                <CheckCircleIcon sx={{ mr: 1, color: '#198754' }} />
                            )}
                            <Typography variant="body2" color={metodoAcceso === 'token' ? '#0d6efd' : '#198754'}>
                                {metodoAcceso === 'token'
                                    ? 'Acceso concedido mediante token'
                                    : 'Acceso concedido con tus permisos'}
                            </Typography>
                        </Box>

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
                width: '98%',
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
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ color: '#0d6efd', fontWeight: 'bold' }}>
                    Introduce tu token de acceso
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Ingresa el token que te ha proporcionado el propietario para acceder a esta propiedad.
                    </DialogContentText>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            p: 2,
                            bgcolor: '#f8f9fa',
                            borderRadius: 1,
                            border: '1px solid #dee2e6'
                        }}
                    >
                        <LockOpenIcon color="primary" sx={{ mr: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Los tokens son códigos únicos que permiten el acceso a una cerradura específica, incluso sin tener permisos permanentes.
                        </Typography>
                    </Box>

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
                        placeholder="Ej: ABC123"
                        helperText="Introduce el código tal como te lo proporcionaron, respetando mayúsculas y minúsculas"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'white'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCerrarTokenDialog}
                        color="inherit"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUsarToken}
                        color="primary"
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Verificar token
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AbrirPuerta;