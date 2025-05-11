import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Paper, IconButton, Button, CircularProgress, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { deleteEventFromCalendar, findEventBySummary, isLoggedIn, signInWithGoogle } from './GoogleAuth';

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
    const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Referencia para el temporizador
    const autoCloseTimerShouldPersist = useRef<boolean>(false); // Referencia para mantener el temporizador

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
                    const cerraduraResponse = await fetch(`https://localhost:8443/api/cerraduras/${cerraduraId}`);
                    if (!cerraduraResponse.ok) {
                        throw new Error('No se pudo recuperar la información de la cerradura');
                    }

                    const cerraduraData = await cerraduraResponse.json();
                    setCerraduraDetalle(cerraduraData);
                    setCerradura(parseInt(cerraduraId));

                    // Obtener información de la propiedad asociada a la cerradura
                    const propiedadNombreResponse = await fetch(`https://localhost:8443/api/cerraduras/${cerraduraId}/propiedad/nombre`);
                    const propiedadDireccionResponse = await fetch(`https://localhost:8443/api/cerraduras/${cerraduraId}/propiedad/direccion`);

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
                    const response = await fetch(`https://localhost:8443/api/propiedades/${propiedadId}`);
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
            fetch(`https://localhost:8443/api/cerraduras/propiedad/${propiedad.id}`)
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

    // Nuevo: useEffect para manejar el cierre automático de la puerta
    useEffect(() => {
        // Solo actuar si la puerta se abrió exitosamente y tenemos la información necesaria
        if (estado === 'exito' && cerradura && usuario && usuario.id) {
            // Limpiar cualquier temporizador existente para evitar múltiples cierres
            if (autoCloseTimeoutRef.current) {
                clearTimeout(autoCloseTimeoutRef.current);
            }

            console.log(`Programando cierre automático para la cerradura ${cerradura} en 60 segundos.`);
            autoCloseTimerShouldPersist.current = true; // Marcar que el temporizador debe persistir
            autoCloseTimeoutRef.current = setTimeout(() => {
                            console.log(`Ejecutando cierre automático para la cerradura ${cerradura}.`);
                fetch(`https://localhost:8443/api/cerraduras/${cerradura}/cerrar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                    .then(async response => {
                        if (!response.ok) {
                            const errorData = await response.text(); // O response.json() si la API devuelve errores en JSON
                            console.error('Error al cerrar la puerta automáticamente:', response.status, errorData);
                            // notificar al usuario si el cierre automático falla?
                        } else {
                            console.log('Puerta cerrada automáticamente con éxito.');
                            // actualizar el estado de la UI, por ejemplo, a 'inicial' o uno nuevo como 'cerrado_auto'?
                        }
                    })
                    .catch(error => {
                        console.error('Error en la llamada fetch para cerrar la puerta automáticamente:', error);
                    })
                    .finally(() => {
                        autoCloseTimeoutRef.current = null; // Resetea la referencia
                        autoCloseTimerShouldPersist.current = false; // Marcar que el temporizador no debe persistir
                    });
            }, 60000); // 90000 ms = 1 minuto
        } else {
            // Si el estado no es 'exito', cualquier temporizador de cierre automático pendiente debe cancelarse.
            if (autoCloseTimeoutRef.current) {
                console.log(`Cancelando temporizador de cierre automático existente porque el estado ya no es 'exito' (estado actual: ${estado}).`);
                clearTimeout(autoCloseTimeoutRef.current);
                autoCloseTimeoutRef.current = null;
            }
            autoCloseTimerShouldPersist.current = false; // No hay temporizador persistente si no estamos en 'exito'
        }

        // Función de limpieza: se ejecuta cuando el componente se desmonta o antes de que el efecto se ejecute de nuevo
        return () => {
            if (autoCloseTimeoutRef.current && !autoCloseTimerShouldPersist.current) {
                console.log(`Limpiando temporizador de cierre automático (no persistente) para la cerradura ${cerradura} al desmontar o cambiar dependencias.`);
                clearTimeout(autoCloseTimeoutRef.current);
                autoCloseTimeoutRef.current = null; // Resetea la referencia
            } else if (autoCloseTimerShouldPersist.current && autoCloseTimeoutRef.current) {
                console.log(`El temporizador de cierre automático persistente para la cerradura ${cerradura} persistirá después del desmotaje/cambio de dependencias.`);
            }
        };
    }, [estado, cerradura, usuario]); // Dependencias del efecto: se re-ejecutará si alguna de estas cambia

    // Verificar si el usuario tiene acceso a la cerradura
    const verificarAccesoUsuario = (cerraduraId: number) => {
        if (!usuario || !usuario.id) {
            setError('Usuario no autenticado');
            setEstado('sin_acceso');
            return;
        }

        setVerificandoAcceso(true);
        // Llamar a la API para verificar acceso
        fetch(`https://localhost:8443/api/cerraduras/${cerraduraId}/verificar-acceso?usuarioId=${usuario.id}`)
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
            await fetch('https://localhost:8443/api/registros-apertura', {
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

        fetch(`https://localhost:8443/api/cerraduras/${cerradura}/abrir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuarioId: usuario.id }),
        })
        .then(async response => {
            if (!response.ok) {
                const motivo = response.status === 403
                    ? 'Acceso denegado (sin permisos)'
                    : 'Error de apertura';
        
                setEstado(response.status === 403 ? 'sin_acceso' : 'error');
        
                const data = await response.json(); // Parse JSON once
                registrarIntentoAcceso(false, motivo);
                throw new Error(data.error || motivo);
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
    
    // Helper function for calendar event deletion
    const tryDeleteCalendarEventForToken = async (tokenCode: string, currentUsos: number, maxUsos: number, propNombre: string | undefined) => {
        if (!propNombre) {
            console.warn('Nombre de la propiedad no disponible, no se puede intentar eliminar evento del calendario.');
            return;
        }
        if (maxUsos > 0 && currentUsos >= maxUsos) {
            console.log(`Token ${tokenCode} para la propiedad "${propNombre}" agotado. Intentando eliminar evento de calendario.`);
            if (isLoggedIn()) {
                try {
                    const eventSummaryToFind = `Token para ${propNombre}: ${tokenCode}`;
                    console.log(`Buscando evento en calendario con resumen: "${eventSummaryToFind}"`);
                    const eventId = await findEventBySummary(eventSummaryToFind);

                    if (eventId) {
                        await deleteEventFromCalendar(eventId);
                        console.log(`Evento de calendario ${eventId} (resumen: "${eventSummaryToFind}") eliminado exitosamente.`);
                    } else {
                        console.log(`No se encontró evento de calendario para eliminar con resumen que contenga: "${eventSummaryToFind}".`);
                    }
                } catch (calendarError) {
                    console.error('Error durante la búsqueda o eliminación del evento de calendario:', calendarError);
                }
            } else {
                console.warn("Usuario no autenticado con Google. No se puede eliminar el evento del calendario.");
                // Considera solicitar inicio de sesión con Google si es deseado:
                // await signInWithGoogle(); 
            }
        }
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
            try { // Primary validation path
                console.log(`Intentando validar token ${token} con usuario ${usuario.id} para cerradura ${cerradura}`);
                const validationResponse = await fetch(`https://localhost:8443/api/tokens/validar?codigo=${token}&cerraduraId=${cerradura}&usuarioId=${usuario.id}`, {
                    method: 'POST',
                });
        
                if (validationResponse.ok) {
                    console.log(`Token ${token} validado para usuario ${usuario.id}, intentando abrir cerradura ${cerradura}`);
                    const abrirResponse = await fetch(`https://localhost:8443/api/cerraduras/${cerradura}/abrir`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuarioId: usuario.id }),
                    });

                    if (!abrirResponse.ok) {
                        const abrirErrorData = await abrirResponse.json();
                        console.error('Error al abrir la puerta después de validar el token (vía primaria):', abrirErrorData);
                        throw new Error(abrirErrorData.error || 'Error al abrir la puerta después de validar el token');
                    }
                    console.log('Puerta abierta con éxito (vía primaria). Obteniendo estado del token para posible acción de calendario.');

                    const tokensListResponse = await fetch('https://localhost:8443/api/tokens');
                    if (!tokensListResponse.ok) {
                        console.warn('No se pudo obtener la lista de tokens para verificar el estado post-uso (vía primaria).');
                    } else {
                        const allTokens = await tokensListResponse.json();
                        const cerraduraIdNum = parseInt(String(cerradura), 10); // Asegurarse que cerradura es string para parseInt
                        const usedTokenObj = allTokens.find((t: any) => t.codigo === token && t.cerradura.id === cerraduraIdNum);

                        if (usedTokenObj) {
                            console.log('Token encontrado post-uso (vía primaria):', usedTokenObj);
                            await tryDeleteCalendarEventForToken(String(usedTokenObj.codigo), usedTokenObj.usosActuales, usedTokenObj.usosMaximos, propiedad?.nombre);
                        } else {
                            console.warn(`No se encontró el token ${token} asociado a la cerradura ${cerraduraIdNum} en la lista después de su uso (vía primaria).`);
                        }
                    }
                    return abrirResponse;
                }
        
                const errorData = await validationResponse.json();
                console.log('Respuesta de validación primaria no OK:', validationResponse.status, errorData);
        
                if (validationResponse.status === 403 && errorData.error === 'No tienes acceso a esta cerradura') {
                    console.log('Intentando validación alternativa basada solo en token...');
                    const tokensResponse = await fetch('https://localhost:8443/api/tokens');
                    if (!tokensResponse.ok) {
                        throw new Error('No se pudo verificar el token (lista no obtenida)');
                    }
                    
                    const tokens = await tokensResponse.json();
                    const cerraduraIdNum = parseInt(String(cerradura), 10); // Asegurarse que cerradura es string para parseInt
                    const tokenObj = tokens.find((t: any) => t.codigo === token && t.cerradura.id === cerraduraIdNum);
    
                    if (!tokenObj) {
                        throw new Error('Token no encontrado o no válido para esta cerradura (vía alternativa)');
                    }
    
                    if (tokenObj.usosMaximos > 0 && tokenObj.usosActuales >= tokenObj.usosMaximos) {
                        await tryDeleteCalendarEventForToken(String(tokenObj.codigo), tokenObj.usosActuales, tokenObj.usosMaximos, propiedad?.nombre);
                        throw new Error('Token sin usos disponibles');
                    }
    
                    if (tokenObj.fechaExpiracion && new Date(tokenObj.fechaExpiracion) < new Date()) {
                        throw new Error('Token expirado');
                    }
    
                    const propietarioId = tokenObj.cerradura.propiedad.propietario.id;
                    const abrirResponseAlt = await fetch(`https://localhost:8443/api/cerraduras/${cerradura}/abrir`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuarioId: propietarioId }),
                    });
    
                    if (!abrirResponseAlt.ok) {
                        const abrirErrorDataAlt = await abrirResponseAlt.json();
                        console.error('Error al abrir la puerta con el token (alternativa):', abrirErrorDataAlt);
                        throw new Error(abrirErrorDataAlt.error || 'Error al abrir la puerta con el token (alternativa)');
                    }
                    console.log('Puerta abierta con éxito (vía alternativa).');
    
                    const updatedTokenData = {
                        ...tokenObj,
                        usosActuales: tokenObj.usosActuales + 1,
                    };
    
                    const updateResponse = await fetch(`https://localhost:8443/api/tokens/${tokenObj.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedTokenData),
                    });

                    if (!updateResponse.ok) {
                        const updateErrorData = await updateResponse.text();
                        console.warn(`No se pudo actualizar el uso del token ${tokenObj.codigo} en el backend: ${updateErrorData}. La puerta pudo haberse abierto.`);
                    } else {
                        console.log(`Uso del token ${tokenObj.codigo} actualizado correctamente en el backend (vía alternativa).`);
                    }
                    
                    await tryDeleteCalendarEventForToken(String(updatedTokenData.codigo), updatedTokenData.usosActuales, updatedTokenData.usosMaximos, propiedad?.nombre);
                    
                    return abrirResponseAlt;
                } else {
                    throw new Error(errorData.error || `Error de validación del token: ${validationResponse.status}`);
                }

            } catch (err: any) { 
                console.error("Error en validarToken:", err.message || err);
                throw err; 
            }
        };

        // Ejecutamos la estrategia de validación
        validarToken()
            .then(response => response?.json())
            .then(data => { // data es el cuerpo de la respuesta JSON
                console.log('Respuesta de apertura/validación:', data);
                setEstado('exito');
                setMetodoAcceso('token'); // O determinar según el flujo
            })
            .catch(err => {
                console.error('Error final en handleUsarToken:', err);
                setError(err.message || 'Error desconocido al usar el token.');
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
                            id='aceptar'
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
                                id='abrirPuertaIcon'
                                src="\src\assets\bluetooth-icono.png"
                                alt="Bluetooth"
                                style={{ width: '130%', height: '130%' }}
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