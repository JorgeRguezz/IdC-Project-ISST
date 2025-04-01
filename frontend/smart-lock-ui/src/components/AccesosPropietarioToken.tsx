import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button, Chip, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

interface Token {
    id: number;
    cerraduraId: number;
    propiedadNombre: string;
    nombreCerradura: string;
    direccion: string;
    fechaFin: string;
    activo: boolean;
    usosActuales: number;
    usosMaximos: number;
    codigo: string;
}

const AccesosPropietarioTokens = () => {
    const navigate = useNavigate();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Recuperación de tokens desde el backend
    useEffect(() => {
        const fetchTokens = async () => {
            setCargando(true);
            setError(null);

            try {
                if (!usuario.id) {
                    console.error('No se pudo identificar el ID del usuario:', usuario);
                    setError('No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
                    setCargando(false);
                    return;
                }

                console.log('Obteniendo tokens para el propietario con ID:', usuario.id);
                const url = `http://localhost:8080/api/propietarios/${usuario.id}/tokens`;
                console.log('URL de la solicitud:', url);

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Estado de la respuesta:', response.status);

                if (!response.ok) {
                    if (response.status === 404) {
                        // Si el propietario no existe en el sistema o no hay datos
                        console.warn('Usuario no encontrado o sin datos (404)');
                        setTokens([]);
                        setCargando(false);
                        return;
                    } else if (response.status === 500) {
                        // Error interno del servidor
                        console.error('Error interno del servidor (500)');
                        throw new Error('Hay un problema en el servidor. Por favor, inténtalo más tarde.');
                    } else {
                        // Cualquier otro error
                        console.error(`Error inesperado (${response.status})`);
                        throw new Error(`No se pudieron obtener los tokens (${response.status}). Por favor, inténtalo de nuevo.`);
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

                // Procesar cada token para obtener información adicional
                const procesarTokens = async () => {
                    const tokensPromesas = data.map(async (item: any) => {
                        console.log('Procesando item de token:', JSON.stringify(item, null, 2));

                        // Inicializar valores por defecto para evitar errores
                        let cerraduraId = null;
                        let propiedadNombre = 'Propiedad no identificada';
                        let nombreCerradura = 'Cerradura sin identificar';
                        let propiedadDireccion = 'Sin dirección';
                        let fechaFin = null;
                        let activo = false;
                        let usosMaximos = 0;
                        let usosActuales = 0;
                        let codigo = 'Código no disponible';

                        // Extraer información básica del token
                        if (item.id) {
                            cerraduraId = item.cerradura?.id || null;
                            usosActuales = item.usosActuales || 0;
                            usosMaximos = item.usosMaximos || 0;
                            codigo = item.codigo || 'Código no disponible';

                            // Obtener información de la cerradura y propiedad
                            if (item.cerradura) {
                                nombreCerradura = item.cerradura.nombre || 'Cerradura sin nombre';
                                if (item.cerradura.propiedad) {
                                    propiedadNombre = item.cerradura.propiedad.nombre || 'Propiedad sin nombre';
                                    propiedadDireccion = item.cerradura.propiedad.direccion || 'Sin dirección';
                                }
                            }

                            // Si tenemos el ID de la cerradura pero no tenemos el nombre de la propiedad o de la cerradura,
                            // intentamos obtenerlos mediante peticiones adicionales
                            if (cerraduraId) {
                                // Si no tenemos el nombre de la propiedad, lo obtenemos
                                if (propiedadNombre === 'Propiedad no identificada' || propiedadNombre === 'Propiedad sin nombre') {
                                    try {
                                        console.log('Consultando nombre de propiedad para cerradura:', cerraduraId);
                                        const response = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/propiedad/nombre`, {
                                            headers: {
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                'Content-Type': 'application/json'
                                            }
                                        });

                                        if (response.ok) {
                                            propiedadNombre = await response.text();
                                            console.log('Nombre de propiedad obtenido del servidor:', propiedadNombre);
                                        }
                                    } catch (error) {
                                        console.error('Error al obtener nombre de propiedad:', error);
                                    }
                                }

                                // Si no tenemos la dirección de la propiedad, la obtenemos
                                if (propiedadDireccion === 'Sin dirección') {
                                    try {
                                        console.log('Consultando dirección de propiedad para cerradura:', cerraduraId);
                                        const response = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/propiedad/direccion`, {
                                            headers: {
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                'Content-Type': 'application/json'
                                            }
                                        });

                                        if (response.ok) {
                                            propiedadDireccion = await response.text();
                                            console.log('Dirección de propiedad obtenida del servidor:', propiedadDireccion);
                                        }
                                    } catch (error) {
                                        console.error('Error al obtener dirección de propiedad:', error);
                                    }
                                }

                                // Si no tenemos el nombre de la cerradura, lo obtenemos
                                if (nombreCerradura === 'Cerradura sin identificar' || nombreCerradura === 'Cerradura sin nombre') {
                                    try {
                                        console.log('Consultando nombre de cerradura:', cerraduraId);
                                        const response = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/nombre`, {
                                            headers: {
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                'Content-Type': 'application/json'
                                            }
                                        });

                                        if (response.ok) {
                                            nombreCerradura = await response.text();
                                            console.log('Nombre de cerradura obtenido del servidor:', nombreCerradura);
                                        }
                                    } catch (error) {
                                        console.error('Error al obtener nombre de cerradura:', error);
                                    }
                                }
                            }

                            // Obtener información del horario
                            if (item.fechaExpiracion) {
                                fechaFin = item.fechaExpiracion || new Date().toISOString();
                            }

                            // Determinar si el token está activo
                            activo = typeof item.activo === 'boolean' ? item.activo : esTokenActivo(fechaFin, usosActuales, usosMaximos);
                        }

                        // Construir el objeto de token formateado
                        const tokenFormateado = {
                            id: typeof item.id === 'number' ? item.id : null,
                            cerraduraId: cerraduraId,
                            propiedadNombre: propiedadNombre,
                            nombreCerradura: nombreCerradura,
                            direccion: propiedadDireccion,
                            codigo: codigo,
                            usosMaximos: usosMaximos,
                            usosActuales: usosActuales,
                            fechaFin: fechaFin,
                            activo: activo
                        };
                        console.log('Token formateado:', tokenFormateado);
                        return tokenFormateado;
                    });
                    
                    // Esperar a que todas las promesas se resuelvan
                    return await Promise.all(tokensPromesas);
                };

                // Procesar los tokens y actualizar el estado
                const tokensFormateados = await procesarTokens();

                console.log('Tokens formateados:', tokensFormateados);
                setTokens(tokensFormateados);
            } catch (error) {
                console.error('Error al obtener tokens:', error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('No se pudieron cargar los tokens. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
                }
                setTokens([]);
            } finally {
                setCargando(false);
            }
        };

        fetchTokens();
    }, [usuario.id]);

    const handleVolver = () => {
        navigate('/propietario-dashboard');
    };

    // Función para verificar si un token está activo
    const esTokenActivo = (fin: string, usosActuales: number, usosMaximos: number) => {
        if (!fin && usosActuales < usosMaximos) return true; // Si no tiene fecha fin comprobamos solo si le quedan usos

        const hoy = new Date();
        // Manejar diferentes formatos de fecha que pueden venir del backend
        let fechaFin: Date;

        try {
            // Intentar parsear la fecha (puede venir en formato ISO o con formato personalizado)
            fechaFin = new Date(fin);

            // Verificar si las fechas son válidas
            if (isNaN(fechaFin.getTime())) {
                console.error('Fechas inválidas:', fin);
                return false;
            }

            return (hoy <= fechaFin && usosActuales < usosMaximos);
        } catch (error) {
            console.error('Error al procesar fechas:', error);
            return false;
        }
    };

    // Función para dar formato a las fechas
    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'Fecha no disponible';

        try {
            const fechaObj = new Date(fecha);

            // Verificar si la fecha es válida
            if (isNaN(fechaObj.getTime())) {
                console.error('Fecha inválida:', fecha);
                return 'Fecha inválida';
            }

            // Formatear fecha con día, mes, año
            const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Formatear hora con hora y minutos
            const horaFormateada = fechaObj.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `${fechaFormateada} ${horaFormateada}`;
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no disponible';
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100vh',
                bgcolor: '#E4F4FF',
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
                    <IconButton color="primary" onClick={handleVolver} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd' }}>
                        Tokens para mis Propiedades
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
                    overflowY: 'auto'
                }}
            >
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
                        Aquí puedes ver todos los tokens a tus propiedades, tanto activos como pasados y futuros.
                        Puedes ver quién tiene token a cada propiedad y durante qué período.
                    </Typography>
                </Paper>

                {/* Lista de tokens */}
                {cargando ? (
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <CircularProgress sx={{ mb: 2, color: '#0d6efd' }} />
                        <Typography variant="body1">Cargando tokens...</Typography>
                    </Paper>
                ) : error ? (
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="error" fontWeight="bold" mb={1}>
                            Error al cargar los tokens
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {error}
                        </Typography>
                        <Button variant="outlined" color="primary" onClick={() => window.location.reload()}>
                            Reintentar
                        </Button>
                    </Paper>
                ) : tokens.length === 0 ? (
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body1">No hay tokens registrados para tus propiedades</Typography>
                    </Paper>
                ) : (
                    tokens.map((token) => {
                        const activo = esTokenActivo(token.fechaFin, token.usosActuales, token.usosMaximos);
                        return (
                            <Paper
                                key={token.id}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 2,
                                    borderRadius: 3,
                                    bgcolor: '#ffffff',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <DoorFrontIcon sx={{ color: '#0d6efd', fontSize: 28, mr: 1.5 }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {token.propiedadNombre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {token.direccion}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={activo ? 'Activo' : 'Inactivo'}
                                        color={activo ? 'success' : 'default'}
                                        size="small"
                                        sx={{ height: 24 }}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <DoorFrontIcon sx={{ fontSize: 20, color: '#0d6efd', mr: 1 }} />
                                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                                        Cerradura:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        {token.nombreCerradura}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PersonIcon sx={{ fontSize: 20, color: '#0d6efd', mr: 1 }} />
                                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                                        Código de acceso:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        {token.codigo}
                                    </Typography>
                                </Box>

                                {token.usosMaximos > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PersonIcon sx={{ fontSize: 20, color: '#0d6efd', mr: 1 }} />
                                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                                            Usos actuales:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            {token.usosActuales}
                                        </Typography>
                                    </Box>
                                )}
                                {token.usosMaximos > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PersonIcon sx={{ fontSize: 20, color: '#0d6efd', mr: 1 }} />
                                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                                            Usos máximos:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            {token.usosMaximos}
                                        </Typography>
                                    </Box>
                                )}

                                {token.usosMaximos === 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PersonIcon sx={{ fontSize: 20, color: '#0d6efd', mr: 1 }} />
                                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                                            Usos ilimitados
                                        </Typography>
                                    </Box>
                                )}


                                {token.fechaFin && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: 20, color: '#0d6efd', mr: 1 }} />
                                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                                            Válido hasta:
                                        </Typography>
                                    </Box>
                                )}
                                {token.fechaFin && (
                                    <Box sx={{ pl: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>{formatearFecha(token.fechaFin)}</strong>
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })
                )}
            </Box>
        </Box>
    );
};

export default AccesosPropietarioTokens;