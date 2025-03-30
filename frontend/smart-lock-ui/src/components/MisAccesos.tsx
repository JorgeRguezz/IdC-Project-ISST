import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Button, Chip, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import { useNavigate } from 'react-router-dom';

interface Acceso {
    id: number;
    cerraduraId: number;
    propiedadNombre: string; // Nombre de la propiedad
    nombreCerradura: string; // Nombre real de la cerradura
    direccion: string;
    propietario: string;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
}

const MisAccesos = () => {
    const navigate = useNavigate();
    const [accesos, setAccesos] = useState<Acceso[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Datos del usuario (esto vendría del contexto de autenticación en una app real)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Recuperación de accesos desde el backend
    useEffect(() => {
        const fetchAccesos = async () => {
            setCargando(true);
            setError(null);

            try {
                if (!usuario.id) {
                    console.error('No se pudo identificar el ID del usuario:', usuario);
                    setError('No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
                    setCargando(false);
                    return;
                }

                console.log('Obteniendo accesos para el huésped con ID:', usuario.id);
                const url = `http://localhost:8080/api/accesos/huesped/${usuario.id}`;
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
                        // Si el huésped no existe en el sistema o no hay datos
                        console.warn('Usuario no encontrado o sin datos (404)');
                        setAccesos([]);
                        setCargando(false);
                        return;
                    } else if (response.status === 500) {
                        // Error interno del servidor
                        console.error('Error interno del servidor (500)');
                        throw new Error('Hay un problema en el servidor. Por favor, inténtalo más tarde.');
                    } else {
                        // Cualquier otro error
                        console.error(`Error inesperado (${response.status})`);
                        throw new Error(`No se pudieron obtener tus accesos (${response.status}). Por favor, inténtalo de nuevo.`);
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

                // Nota: La función para obtener detalles de propiedad por ID de cerradura ha sido eliminada
                // ya que el endpoint no existe en el backend. En su lugar, usaremos la información
                // que ya tenemos disponible en el objeto de acceso.

                // Función para obtener detalles de un propietario por ID
                const obtenerDetallesPropietario = async (propietarioId: number) => {
                    try {
                        console.log(`Obteniendo detalles de propietario ID: ${propietarioId}`);
                        const response = await fetch(`http://localhost:8080/api/usuarios/${propietarioId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!response.ok) {
                            console.warn(`No se pudo obtener el propietario ${propietarioId}`);
                            return null;
                        }

                        const responseText = await response.text();
                        if (!responseText) return null;

                        const propietario = JSON.parse(responseText);
                        console.log(`Detalles de propietario obtenidos:`, propietario);
                        return propietario;
                    } catch (error) {
                        console.error(`Error al obtener detalles de propietario:`, error);
                        return null;
                    }
                };

                // Procesar cada acceso de forma asíncrona para obtener datos adicionales si es necesario
                const procesarAccesos = async () => {
                    const accesosPromesas = data.map(async (item: any) => {
                        console.log('Procesando item de acceso:', JSON.stringify(item, null, 2));

                        // Inicializar valores por defecto para evitar errores
                        let cerraduraId = null;
                        let propiedadId = null;
                        let propiedadNombre = ''; // Inicializamos vacío para detectar si se asigna un valor después
                        let propiedadDireccion = 'Sin dirección';
                        let nombreCerradura = 'Cerradura sin identificar';
                        let propietarioNombre = 'Propietario desconocido';
                        let propietarioId = null;
                        let fechaInicio = new Date().toISOString();
                        let fechaFin = new Date().toISOString();
                        let activo = false;

                        // PASO 1: Extraer información de la cerradura con manejo seguro
                        const cerradura = item.cerradura || {};
                        cerraduraId = cerradura.id || null;
                        console.log(`PASO 1: ID de cerradura obtenido: ${cerraduraId}`);
                        console.log('Datos de cerradura:', JSON.stringify(cerradura, null, 2));

                        // // PASO 2: Extraer información de la propiedad con manejo seguro
                        // // Intentar obtener la propiedad desde diferentes rutas posibles
                        // const propiedad = cerradura.propiedad || item.propiedad || {};
                        // propiedadId = propiedad.id || null;
                        // console.log(`PASO 2: ID de propiedad obtenido: ${propiedadId}`);
                        // console.log('Datos de propiedad:', JSON.stringify(propiedad, null, 2));

                        // // Si no tenemos ID de propiedad pero tenemos ID de cerradura, consultar directamente a la API
                        // if (!propiedadId && cerraduraId) {
                        //     try {
                        //         console.log(`PASO 2B: No se encontró ID de propiedad. Consultando API para cerradura: ${cerraduraId}`);
                        //         const cerraduraResponse = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}`, {
                        //             headers: {
                        //                 'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        //                 'Content-Type': 'application/json'
                        //             }
                        //         });

                        //         if (cerraduraResponse.ok) {
                        //             const cerraduraText = await cerraduraResponse.text();
                        //             console.log(`Respuesta detallada de cerradura ${cerraduraId}:`, cerraduraText);

                        //             try {
                        //                 const cerraduraDetallada = JSON.parse(cerraduraText);
                        //                 console.log('Cerradura detallada parseada:', cerraduraDetallada);

                        //                 // Intentar obtener el ID de propiedad directamente del objeto de cerradura
                        //                 if (cerraduraDetallada.propiedadId) {
                        //                     propiedadId = cerraduraDetallada.propiedadId;
                        //                     console.log(`PASO 2C: ID de propiedad obtenido desde propiedadId: ${propiedadId}`);
                        //                 } else if (cerraduraDetallada.propiedad && cerraduraDetallada.propiedad.id) {
                        //                     propiedadId = cerraduraDetallada.propiedad.id;
                        //                     console.log(`PASO 2D: ID de propiedad obtenido desde propiedad.id: ${propiedadId}`);
                        //                 }
                        //             } catch (parseError) {
                        //                 console.error('Error al parsear respuesta de cerradura:', parseError);
                        //             }
                        //         } else {
                        //             console.warn(`No se pudo obtener detalles de la cerradura ${cerraduraId}`);
                        //         }
                        //     } catch (error) {
                        //         console.error('Error al consultar detalles de cerradura:', error);
                        //     }
                        // }
                        // PASO 2: Extraer información de la propiedad con manejo seguro
                        const propiedad = cerradura.propiedad || item.propiedad || {};
                        propiedadId = propiedad.id || null;
                        
                        // PASO ÚNICO: Obtener el nombre de la propiedad directamente desde la API
                        let nombrePropiedad = "Propiedad no identificada";

                        if (cerraduraId) {
                            try {
                                console.log(`Consultando nombre de propiedad para la cerradura: ${cerraduraId}`);
                                const propiedadResponse = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}/propiedad/nombre`, {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                if (propiedadResponse.ok) {
                                    nombrePropiedad = await propiedadResponse.text();
                                    console.log(`Nombre de propiedad obtenido: ${nombrePropiedad}`);
                                } else {
                                    console.warn(`No se pudo obtener el nombre de la propiedad para la cerradura ${cerraduraId}`);
                                }
                            } catch (error) {
                                console.error('Error al consultar el nombre de la propiedad:', error);
                            }
                        }


                        // PASO 3: Obtener el nombre de la cerradura con manejo seguro
                        if (typeof cerradura.nombre === 'string' && cerradura.nombre.trim() !== '') {
                            nombreCerradura = cerradura.nombre.trim();
                        } else if (typeof cerradura.modelo === 'string' && cerradura.modelo.trim() !== '') {
                            nombreCerradura = `Cerradura ${cerradura.modelo.trim()}`;
                        }
                        console.log(`PASO 3: Nombre de cerradura obtenido: ${nombreCerradura}`);

                        // PASO 4: Obtener el nombre y dirección de la propiedad con manejo seguro
                        // Intentar diferentes rutas para obtener el nombre de la propiedad
                        if (typeof propiedad.nombre === 'string' && propiedad.nombre.trim() !== '') {
                            propiedadNombre = propiedad.nombre.trim();
                            console.log(`PASO 4A: Nombre de propiedad obtenido directamente: ${propiedadNombre}`);
                        } else if (propiedadId) {
                            // Si tenemos ID de propiedad pero no su nombre, intentar obtenerlo desde la API
                            try {
                                console.log(`PASO 4B: Intentando obtener nombre de propiedad por ID: ${propiedadId}`);
                                const response = await fetch(`http://localhost:8080/api/propiedades/${propiedadId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                if (response.ok) {
                                    // Obtener la respuesta como texto primero para depuración
                                    const responseText = await response.text();
                                    console.log(`Respuesta de propiedad ${propiedadId}:`, responseText);

                                    // Intentar analizar el texto como JSON
                                    try {
                                        const propiedadData = JSON.parse(responseText);
                                        console.log(`Datos de propiedad ${propiedadId} parseados:`, propiedadData);

                                        if (propiedadData && typeof propiedadData.nombre === 'string' && propiedadData.nombre.trim() !== '') {
                                            propiedadNombre = propiedadData.nombre.trim();
                                            console.log(`PASO 4C: Nombre de propiedad obtenido por API: ${propiedadNombre}`);

                                            // Actualizar también la dirección si está disponible
                                            if (typeof propiedadData.direccion === 'string' && propiedadData.direccion.trim() !== '') {
                                                propiedadDireccion = propiedadData.direccion.trim();
                                                console.log(`Dirección de propiedad obtenida por API: ${propiedadDireccion}`);
                                            }

                                            // Actualizar también el propietario si está disponible
                                            if (propiedadData.propietario && typeof propiedadData.propietario.nombre === 'string') {
                                                propietarioNombre = propiedadData.propietario.nombre.trim();
                                                console.log(`Nombre de propietario obtenido desde propiedad: ${propietarioNombre}`);
                                            } else if (typeof propiedadData.propietarioId === 'number') {
                                                propietarioId = propiedadData.propietarioId;
                                            }
                                        }
                                    } catch (parseError) {
                                        console.error(`Error al parsear datos de propiedad ${propiedadId}:`, parseError);
                                    }
                                } else {
                                    console.warn(`No se pudo obtener la propiedad con ID ${propiedadId}, status: ${response.status}`);
                                }
                            } catch (error) {
                                console.error('Error al obtener detalles de la propiedad:', error);
                            }
                        } else if (cerraduraId) {
                            // Si tenemos ID de cerradura pero no de propiedad, intentar obtener la propiedad asociada
                            try {
                                console.log(`PASO 4D: Intentando obtener propiedad por ID de cerradura: ${cerraduraId}`);
                                const response = await fetch(`http://localhost:8080/api/cerraduras/${cerraduraId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                        'Content-Type': 'application/json'
                                    }
                                });

                                if (response.ok) {
                                    // Obtener la respuesta como texto primero para depuración
                                    const responseText = await response.text();
                                    console.log(`Respuesta de cerradura ${cerraduraId}:`, responseText);

                                    // Intentar analizar el texto como JSON
                                    try {
                                        const cerraduraData = JSON.parse(responseText);
                                        console.log(`Datos de cerradura ${cerraduraId} parseados:`, cerraduraData);

                                        // Verificar si la cerradura tiene una propiedad asociada
                                        if (cerraduraData && cerraduraData.propiedad) {
                                            // Guardar el ID de la propiedad para posibles consultas adicionales
                                            if (typeof cerraduraData.propiedad.id === 'number') {
                                                propiedadId = cerraduraData.propiedad.id;
                                                console.log(`ID de propiedad obtenido desde cerradura: ${propiedadId}`);

                                                // Intentar obtener detalles completos de la propiedad usando su ID
                                                if (propiedadId) {
                                                    try {
                                                        console.log(`Obteniendo detalles completos de propiedad ID: ${propiedadId}`);
                                                        const propResponse = await fetch(`http://localhost:8080/api/propiedades/${propiedadId}`, {
                                                            headers: {
                                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                'Content-Type': 'application/json'
                                                            }
                                                        });

                                                        if (propResponse.ok) {
                                                            const propText = await propResponse.text();
                                                            try {
                                                                const propiedadCompleta = JSON.parse(propText);
                                                                console.log(`Datos completos de propiedad ${propiedadId}:`, propiedadCompleta);

                                                                if (propiedadCompleta && typeof propiedadCompleta.nombre === 'string' && propiedadCompleta.nombre.trim() !== '') {
                                                                    propiedadNombre = propiedadCompleta.nombre.trim();
                                                                    console.log(`Nombre de propiedad obtenido desde consulta completa: ${propiedadNombre}`);

                                                                    // Actualizar también la dirección si está disponible
                                                                    if (typeof propiedadCompleta.direccion === 'string' && propiedadCompleta.direccion.trim() !== '') {
                                                                        propiedadDireccion = propiedadCompleta.direccion.trim();
                                                                    }
                                                                }
                                                            } catch (parseErr) {
                                                                console.error(`Error al parsear datos completos de propiedad:`, parseErr);
                                                            }
                                                        }
                                                    } catch (propError) {
                                                        console.error(`Error al obtener detalles completos de propiedad:`, propError);
                                                    }
                                                }
                                            }

                                            // Si no pudimos obtener el nombre desde la consulta completa, intentar desde la respuesta de cerradura
                                            if (!propiedadNombre && typeof cerraduraData.propiedad.nombre === 'string' && cerraduraData.propiedad.nombre.trim() !== '') {
                                                propiedadNombre = cerraduraData.propiedad.nombre.trim();
                                                console.log(`PASO 4E: Nombre de propiedad obtenido desde cerradura por API: ${propiedadNombre}`);
                                            }

                                            // Actualizar también la dirección si está disponible
                                            if (typeof cerraduraData.propiedad.direccion === 'string' && cerraduraData.propiedad.direccion.trim() !== '') {
                                                propiedadDireccion = cerraduraData.propiedad.direccion.trim();
                                            }
                                        }
                                    } catch (parseError) {
                                        console.error(`Error al parsear datos de cerradura ${cerraduraId}:`, parseError);
                                    }
                                } else {
                                    console.warn(`No se pudo obtener la cerradura con ID ${cerraduraId}, status: ${response.status}`);
                                }
                            } catch (error) {
                                console.error('Error al obtener detalles de la cerradura:', error);
                            }
                        } else if (typeof cerradura.nombre === 'string' && cerradura.nombre.trim() !== '') {
                            propiedadNombre = cerradura.nombre.trim();
                            console.log(`PASO 4F: Nombre de propiedad obtenido desde nombre de cerradura: ${propiedadNombre}`);
                        } else if (typeof cerradura.modelo === 'string' && cerradura.modelo.trim() !== '') {
                            // Como último recurso, usar el modelo de la cerradura para crear un nombre descriptivo
                            propiedadNombre = `Propiedad con cerradura ${cerradura.modelo.trim()}`;
                            console.log(`PASO 4G: Usando modelo de cerradura como nombre de propiedad: ${propiedadNombre}`);
                        }

                        // Intentar obtener la dirección de la propiedad
                        if (typeof propiedad.direccion === 'string' && propiedad.direccion.trim() !== '') {
                            propiedadDireccion = propiedad.direccion.trim();
                            console.log(`PASO 4D: Dirección de propiedad obtenida: ${propiedadDireccion}`);
                        }

                        // PASO 5: Obtener información del propietario con manejo seguro
                        // Intentar diferentes rutas para obtener el ID del propietario
                        if (propiedad.propietario && typeof propiedad.propietario.id === 'number') {
                            propietarioId = propiedad.propietario.id;
                        } else if (typeof propiedad.propietarioId === 'number') {
                            propietarioId = propiedad.propietarioId;
                        }
                        console.log(`PASO 5: ID de propietario obtenido: ${propietarioId}`);

                        // Intentar diferentes rutas para obtener el nombre del propietario
                        if (propiedad.propietario && typeof propiedad.propietario.nombre === 'string' && propiedad.propietario.nombre.trim() !== '') {
                            propietarioNombre = propiedad.propietario.nombre.trim();
                            console.log(`PASO 5A: Nombre de propietario obtenido desde objeto anidado: ${propietarioNombre}`);
                        } else if (typeof propiedad.propietarioNombre === 'string' && propiedad.propietarioNombre.trim() !== '') {
                            propietarioNombre = propiedad.propietarioNombre.trim();
                            console.log(`PASO 5B: Nombre de propietario obtenido desde propietarioNombre: ${propietarioNombre}`);
                        } else if (propietarioId) {
                            // Si tenemos ID de propietario pero no su nombre, intentar obtenerlo
                            console.log(`PASO 5C: Intentando obtener detalles del propietario ID: ${propietarioId}`);
                            try {
                                const propietarioDetalle = await obtenerDetallesPropietario(propietarioId);
                                if (propietarioDetalle && typeof propietarioDetalle.nombre === 'string' && propietarioDetalle.nombre.trim() !== '') {
                                    propietarioNombre = propietarioDetalle.nombre.trim();
                                    console.log(`PASO 5D: Nombre de propietario obtenido por API: ${propietarioNombre}`);
                                }
                            } catch (error) {
                                console.error('Error al obtener detalles del propietario:', error);
                            }
                        }

                        // PASO 6: Extraer información del horario con manejo seguro
                        const horario = item.horario || {};
                        console.log('Datos de horario:', JSON.stringify(horario, null, 2));

                        if (typeof horario.inicio === 'string' && horario.inicio.trim() !== '') {
                            fechaInicio = horario.inicio;
                        }

                        if (typeof horario.fin === 'string' && horario.fin.trim() !== '') {
                            fechaFin = horario.fin;
                        }

                        // Determinar si el acceso está activo
                        if (typeof item.activo === 'boolean') {
                            activo = item.activo;
                        } else {
                            activo = esAccesoActivo(fechaInicio, fechaFin);
                        }

                        // Si después de todos los intentos no tenemos nombre de propiedad, usar un valor por defecto
                        if (!propiedadNombre) {
                            propiedadNombre = 'Propiedad sin identificar';
                            console.log('PASO FINAL: No se pudo obtener nombre de propiedad, usando valor por defecto');
                        }

                        // Construir el objeto de acceso formateado
                        const accesoFormateado = {
                            id: typeof item.id === 'number' ? item.id : null,
                            cerraduraId: cerraduraId,
                            propiedadNombre: propiedadNombre,
                            nombreCerradura: nombreCerradura,
                            direccion: propiedadDireccion,
                            propietario: propietarioNombre,
                            fechaInicio: fechaInicio,
                            fechaFin: fechaFin,
                            activo: activo
                        };

                        console.log('Acceso formateado:', accesoFormateado);
                        return accesoFormateado;
                    });

                    // Esperar a que todas las promesas se resuelvan
                    return await Promise.all(accesosPromesas);
                };

                // Procesar los accesos y actualizar el estado
                const accesosFormateados = await procesarAccesos();

                console.log('Accesos formateados:', accesosFormateados);
                setAccesos(accesosFormateados);
            } catch (error) {
                console.error('Error al obtener accesos:', error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('No se pudieron cargar tus accesos. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
                }
                setAccesos([]);
            } finally {
                setCargando(false);
            }
        };

        fetchAccesos();
    }, [usuario.id]);

    const handleVolver = () => {
        navigate('/huesped-dashboard');
    };

    // Función para verificar si un acceso está activo
    const esAccesoActivo = (inicio: string, fin: string) => {
        if (!inicio || !fin) return false;

        const hoy = new Date();
        // Manejar diferentes formatos de fecha que pueden venir del backend
        let fechaInicio: Date;
        let fechaFin: Date;

        try {
            // Intentar parsear la fecha (puede venir en formato ISO o con formato personalizado)
            fechaInicio = new Date(inicio);
            fechaFin = new Date(fin);

            // Verificar si las fechas son válidas
            if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
                console.error('Fechas inválidas:', inicio, fin);
                return false;
            }

            return hoy >= fechaInicio && hoy <= fechaFin;
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
                    {cargando ? (
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                                <CircularProgress size={40} sx={{ mb: 2, color: '#0d6efd' }} />
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    Cargando tus accesos...
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Esto tomará solo unos segundos
                                </Typography>
                            </Box>
                        </Paper>
                    ) : error ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'white',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2
                                    }}
                                >
                                    <Typography sx={{ color: '#f44336', fontWeight: 'bold' }}>!</Typography>
                                </Box>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium', color: 'error.main' }}>
                                    Error al cargar tus accesos
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                    {error}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={() => window.location.reload()}
                                    sx={{ borderRadius: 1, textTransform: 'none' }}
                                >
                                    Intentar nuevamente
                                </Button>
                            </Box>
                        </Paper>
                    ) : accesos.length === 0 ? (
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '80%' }}>
                                            <DoorFrontIcon sx={{ color: '#0d6efd', mr: 1, fontSize: 28 }} />
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                    {acceso.propiedadNombre}
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ color: '#666', fontSize: '0.9rem' }}>
                                                    {acceso.direccion}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={activo ? "Activo" : "Inactivo"}
                                            color={activo ? "success" : "default"}
                                            size="small"
                                            sx={{ height: 24 }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                                        <AccessTimeIcon sx={{ color: '#0d6efd', fontSize: 20, mr: 1 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#444' }}>
                                            Período de acceso:
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 4, color: '#555' }}>
                                        Desde: {formatearFecha(acceso.fechaInicio)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 4, color: '#555' }}>
                                        Hasta: {formatearFecha(acceso.fechaFin)}
                                    </Typography>

                                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#444' }}>
                                            Cerradura:
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1, color: '#555' }}>
                                            {acceso.nombreCerradura}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#444' }}>
                                            Propietario:
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 1, color: '#555' }}>
                                            {acceso.propietario}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={!activo}
                                            onClick={() => navigate(`/abrir-puerta/${acceso.cerraduraId}`)}
                                            sx={{
                                                borderRadius: 1,
                                                textTransform: 'none',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                                                }
                                            }}
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