import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AnadirPuerta = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [touchedFields, setTouchedFields] = useState({
    nombre: false,
    direccion: false,
    ciudad: false,
    modeloCerradura: false,
    codigoConexion: false
  });

  // Obtener usuario de localStorage sin mostrar el mensaje
  const usuarioStr = localStorage.getItem('usuario') || '{}';
  const usuario = JSON.parse(usuarioStr);

  // Verificar si los datos del usuario están disponibles al iniciar (sin mostrar información)
  useEffect(() => {
    if (!usuario || !usuario.id) {
      setErrorMessage('No se ha encontrado información del usuario. Por favor, inicie sesión de nuevo.');
    }
  }, [usuario]);

  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    // Nuevos campos para la cerradura
    modeloCerradura: '',
    codigoConexion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Marcar el campo como tocado cuando el usuario lo modifique
    setTouchedFields({ ...touchedFields, [name]: true });
  };

  // Función para volver a la vista anterior
  const handleVolver = () => {
    navigate(-1);
  };

  // Función para verificar si un propietario existe
  const verificarPropietario = async (): Promise<boolean> => {
    try {
      console.log('----- Verificando propietario -----');
      console.log('Consultando endpoint: http://localhost:8080/api/usuarios/email?email=', usuario.email);

      const response = await fetch(`http://localhost:8080/api/usuarios/email?email=${usuario.email}`);

      console.log('Respuesta status: ', response.status);

      if (!response.ok) {
        const msg = await response.text();
        alert('❌ Error al registrar acceso: ' + msg);
        return false;
      }

      const data = await response.json();
      console.log('Datos obtenidos: ', JSON.stringify(data, null, 2));

      if (data && data.id) {
        console.log('Propietario verificado: ID ', data.id);
        return true;
      } else {
        console.log('No se encontró el propietario');
        return false;
      }
    } catch (error) {
      console.error("Error al verificar propietario:", error);
      console.log('Error al verificar propietario: ', error);
      return false;
    }
  };

  const handleCrearPuerta = async () => {
    // Limpiar mensajes anteriores
    console.log('Comenzando proceso de creación de propiedad y cerradura');
    setErrorMessage('');
    setIsLoading(true);

    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields({
      nombre: true,
      direccion: true,
      ciudad: true,
      modeloCerradura: true,
      codigoConexion: true
    });

    try {
      // Validar campos obligatorios de la propiedad
      if (!form.nombre || form.nombre.trim() === '') {
        setErrorMessage('El nombre de la puerta es obligatorio');
        setIsLoading(false);
        return;
      }

      if (!form.direccion || form.direccion.trim() === '') {
        setErrorMessage('La dirección es obligatoria');
        setIsLoading(false);
        return;
      }

      if (!form.ciudad || form.ciudad.trim() === '') {
        setErrorMessage('La ciudad es obligatoria');
        setIsLoading(false);
        return;
      }

      // Validaciones de los campos de la cerradura
      if (!form.modeloCerradura || form.modeloCerradura.trim() === '') {
        setErrorMessage("Por favor, ingrese el modelo de la cerradura");
        setIsLoading(false);
        return;
      }

      if (!form.codigoConexion || form.codigoConexion.trim() === '') {
        setErrorMessage("Por favor, ingrese el código de conexión (este código no se almacenará)");
        setIsLoading(false);
        return;
      }

      const direccionCompleta = `${form.direccion.trim()}, ${form.ciudad.trim()}`;

      // Asegurarse de que el ID del propietario es un número válido
      if (!usuario || !usuario.id) {
        setErrorMessage("Error: No se encontró información del usuario. Por favor, inicie sesión de nuevo.");
        setIsLoading(false);
        return;
      }

      // Verificar que el usuario sea propietario (soporta mayúsculas o minúsculas)
      const tipoUsuario = usuario.tipo?.toUpperCase();
      setStatusMessage(prevMsg => `${prevMsg}\nTipo de usuario: ${tipoUsuario}`);

      if (tipoUsuario !== 'PROPIETARIO') {
        setErrorMessage(`Error: Solo los propietarios pueden crear propiedades. Tipo actual: ${tipoUsuario}`);
        setIsLoading(false);
        return;
      }

      // Convertir ID a número (importante para evitar problemas con los tipos)
      const propietarioId = parseInt(usuario.id.toString(), 10);

      if (isNaN(propietarioId) || propietarioId <= 0) {
        setErrorMessage(`Error: ID de propietario inválido (${propietarioId})`);
        setIsLoading(false);
        return;
      }

      // Verificar que el propietario existe
      const propietarioExiste = await verificarPropietario();
      if (!propietarioExiste) {
        setErrorMessage(`Error: No se pudo verificar la existencia del propietario con ID ${propietarioId}`);
        setIsLoading(false);
        return;
      }

      try {
        // Primero creamos el objeto propiedad para el endpoint de propiedades-con-imagen 
        const propiedadData = {
          nombre: form.nombre.trim(),
          direccion: direccionCompleta,
          propietario: {
            id: propietarioId
          }
        };

        console.log('----- Creando propiedad -----');
        console.log('Enviando datos de propiedad: ', JSON.stringify(propiedadData, null, 2));

        // Usar FormData para enviar los datos y la imagen si existe
        const formData = new FormData();

        // Añadimos los datos de la propiedad como JSON
        formData.append("propiedad", JSON.stringify(propiedadData));

        // Si hay una imagen, la añadimos
        if (imagenFile) {
          formData.append("imagen", imagenFile);
          console.log('Añadiendo imagen: ', imagenFile.name, imagenFile.size, 'bytes');
        } else {
          console.log('No se ha seleccionado ninguna imagen');
        }

        // Crear la propiedad primero
        const propiedadResponse = await fetch("http://localhost:8080/api/propiedades-con-imagen", {
          method: "POST",
          body: formData
        });

        console.log('Respuesta status: ', propiedadResponse.status);

        if (!propiedadResponse.ok) {
          let errorMsg = await manejarErrorRespuesta(propiedadResponse);
          setErrorMessage(`Error al crear la propiedad: ${errorMsg}`);
          setIsLoading(false);
          return;
        }

        // Si llegamos aquí, la propiedad se creó correctamente
        const propiedadCreada = await propiedadResponse.json();
        console.log('Propiedad creada: ', JSON.stringify(propiedadCreada, null, 2));

        // Obtener el ID de la propiedad creada
        const propiedadId = propiedadCreada.id;

        if (!propiedadId) {
          setErrorMessage("Error: No se pudo obtener el ID de la propiedad creada");
          setIsLoading(false);
          return;
        }

        // Crear la cerradura para esta propiedad
        const cerraduraData = {
          modelo: form.modeloCerradura.trim(),
          bloqueada: true,
          propiedad: {
            id: propiedadId
          }
        };

        console.log('----- Creando cerradura -----');
        console.log('Enviando datos de cerradura:\n', JSON.stringify(cerraduraData, null, 2));

        // Llamar a la API para crear la cerradura
        const cerraduraResponse = await fetch("http://localhost:8080/api/cerraduras/create", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cerraduraData)
        });

        console.log('Respuesta status: ', cerraduraResponse.status);

        if (!cerraduraResponse.ok) {
          let errorMsg = await manejarErrorRespuesta(cerraduraResponse);
          setErrorMessage(`Error al crear la cerradura: ${errorMsg}. La propiedad se creó correctamente.`);
          setIsLoading(false);
          return;
        }

        const cerraduraCreada = await cerraduraResponse.json();
        console.log('Cerradura creada: ', JSON.stringify(cerraduraCreada, null, 2));

        // Todo se completó correctamente
        console.log('----- Proceso completado con éxito -----');
        alert('Puerta y cerradura añadidas correctamente');
        navigate('/propietario-dashboard');
      } catch (error: any) {
        console.error('Error al crear la propiedad y cerradura:', error);
        setErrorMessage(`Error en la comunicación con el servidor: ${error.message || error}`);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error general:', error);
      setErrorMessage(`Error en la aplicación: ${error.message || error}`);
      setIsLoading(false);
    }
  };

  // Función auxiliar para manejar errores de respuesta
  const manejarErrorRespuesta = async (response: Response) => {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const contentType = response.headers.get('content-type');
      console.log('Content-Type: ', contentType);

      if (contentType && contentType.includes('application/json')) {
        // Si es JSON, intentar parsear
        const errorData = await response.json();
        console.error('Error del servidor (JSON):', errorData);

        if (errorData.error) {
          errorMsg = errorData.error;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.trace) {
          // Intentar extraer mensaje útil del trace
          const match = errorData.trace.match(/ConstraintViolationException: (.*?)(?:\r|\n|$)/);
          if (match && match[1]) {
            errorMsg = match[1];
          }
        }

        console.log('Error JSON: ', JSON.stringify(errorData, null, 2));
      } else {
        // Si no es JSON, obtener como texto
        const text = await response.text();
        console.error('Error del servidor (texto):', text);
        errorMsg = text || errorMsg;
        console.log('Error texto: ', text);
      }
    } catch (e) {
      console.error('Error al analizar la respuesta de error:', e);
      console.log('Error al procesar respuesta: ', e);
    }
    return errorMsg;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#ebf5ff',
        px: 2,
        py: 3,
        overflowY: 'auto'
      }}
    >

      {/* Encabezado con título y botón de volver */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleVolver}
        sx={{ mb: 2, color: '#0d6efd', alignSelf: 'flex-start' }}
      >
        Volver
      </Button>

      <Typography variant="h5" sx={{ mb: 3, color: '#0d6efd', fontWeight: 'bold' }}>
        Añadir puerta
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {statusMessage && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', whiteSpace: 'pre-line' }}>
          <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
            {statusMessage}
          </Typography>
        </Paper>
      )}

      {/* Sección de datos de la propiedad */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
        Datos de la propiedad
      </Typography>

      <TextField
        fullWidth
        label="Nombre de la puerta"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
        error={touchedFields.nombre && !form.nombre}
        helperText={touchedFields.nombre && !form.nombre ? "Este campo es obligatorio" : ""}
      />

      <TextField
        fullWidth
        label="Dirección"
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
        error={touchedFields.direccion && !form.direccion}
        helperText={touchedFields.direccion && !form.direccion ? "Este campo es obligatorio" : ""}
      />

      <TextField
        fullWidth
        label="Ciudad"
        name="ciudad"
        value={form.ciudad}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
        error={touchedFields.ciudad && !form.ciudad}
        helperText={touchedFields.ciudad && !form.ciudad ? "Este campo es obligatorio" : ""}
      />

      <Paper
        variant="outlined"
        sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 16 }}
        />
      </Paper>

      {/* Sección de datos de la cerradura */}
      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
        Datos de la cerradura
      </Typography>

      <TextField
        fullWidth
        label="Modelo de cerradura"
        name="modeloCerradura"
        value={form.modeloCerradura}
        onChange={handleChange}
        placeholder="Ej. Smart Lock X1000"
        sx={{ mb: 2 }}
        required
        error={touchedFields.modeloCerradura && !form.modeloCerradura}
        helperText={touchedFields.modeloCerradura && !form.modeloCerradura ? "Este campo es obligatorio" : ""}
      />

      <TextField
        fullWidth
        label="Código de conexión"
        name="codigoConexion"
        value={form.codigoConexion}
        onChange={handleChange}
        placeholder="Código único para configurar la cerradura (no se almacenará)"
        helperText={touchedFields.codigoConexion && !form.codigoConexion ? "Este campo es obligatorio para la configuración" : "Este código es solo para la configuración inicial y no se guardará en la base de datos"}
        sx={{ mb: 3 }}
        required
        error={touchedFields.codigoConexion && !form.codigoConexion}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ bgcolor: '#0d6efd', textTransform: 'none', fontWeight: 'bold' }}
        onClick={handleCrearPuerta}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Crear puerta y cerradura'}
      </Button>
    </Box>
  );
};

export default AnadirPuerta;
