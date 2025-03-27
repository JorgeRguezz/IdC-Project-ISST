import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AnadirPuerta = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);

  // Obtener y mostrar el usuario de localStorage
  const usuarioStr = localStorage.getItem('usuario') || '{}';
  console.log('Usuario en localStorage:', usuarioStr);
  const usuario = JSON.parse(usuarioStr);

  // Actualizar mensaje con información del usuario
  useEffect(() => {
    setStatusMessage(`Usuario cargado: ${JSON.stringify(usuario)}`);
  }, []);

  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCrearPuerta = async () => {
    // Limpiar mensajes anteriores
    setStatusMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const direccionCompleta = `${form.direccion}, ${form.ciudad}`;

      // Asegurarse de que el ID del propietario es un número
      const propietarioId = usuario.id ? parseInt(usuario.id, 10) : null;
      setStatusMessage(`ID del propietario: ${propietarioId} (${typeof propietarioId})`);
      console.log("ID del propietario:", propietarioId, "Tipo:", typeof propietarioId);

      if (!propietarioId) {
        setErrorMessage("Error: No se encontró el ID del propietario. Por favor, inicie sesión de nuevo.");
        setIsLoading(false);
        return;
      }

      const propiedad = {
        nombre: form.nombre,
        direccion: direccionCompleta,
        propietario: { id: propietarioId }
      };

      setStatusMessage(prevMsg => `${prevMsg}\nDatos a enviar: ${JSON.stringify(propiedad)}`);
      console.log("Datos de la propiedad a enviar:", JSON.stringify(propiedad));

      let response;

      if (imagenFile) {
        // Si hay una imagen, usar el endpoint multipart/form-data
        const formData = new FormData();
        formData.append("propiedad", JSON.stringify(propiedad));
        formData.append("imagen", imagenFile);

        setStatusMessage(prevMsg => `${prevMsg}\nEnviando a: /api/propiedades-con-imagen`);
        console.log("Enviando datos con imagen a:", "http://localhost:8080/api/propiedades-con-imagen");

        response = await fetch("http://localhost:8080/api/propiedades-con-imagen", {
          method: "POST",
          body: formData
        });
      } else {
        // Si no hay imagen, usar el endpoint JSON estándar
        setStatusMessage(prevMsg => `${prevMsg}\nEnviando a: /api/propiedades`);

        response = await fetch("http://localhost:8080/api/propiedades", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propiedad)
        });
      }

      setStatusMessage(prevMsg => `${prevMsg}\nRespuesta recibida: ${response.status} ${response.statusText}`);

      if (response.ok) {
        alert('Puerta añadida correctamente');
        navigate('/propietario-dashboard');
      } else {
        // Intentar obtener más información del error
        let errorMsg = 'Error desconocido';
        try {
          const contentType = response.headers.get('content-type');
          setStatusMessage(prevMsg => `${prevMsg}\nContent-Type: ${contentType}`);

          if (contentType && contentType.includes('application/json')) {
            // Si es JSON, intentar parsear
            const errorData = await response.json();
            console.error('Error del servidor (JSON):', errorData);
            errorMsg = errorData.error || errorData.message || `Error ${response.status}`;
            setStatusMessage(prevMsg => `${prevMsg}\nError JSON: ${JSON.stringify(errorData)}`);
          } else {
            // Si no es JSON, obtener como texto
            const text = await response.text();
            console.error('Error del servidor (texto):', text);
            errorMsg = text || `Error ${response.status}`;
            setStatusMessage(prevMsg => `${prevMsg}\nError texto: ${text}`);
          }
        } catch (e) {
          console.error('Error al analizar la respuesta de error:', e);
          errorMsg = `Error ${response.status}: No se pudo procesar la respuesta`;
          setStatusMessage(prevMsg => `${prevMsg}\nError al procesar respuesta: ${e}`);
        }

        setErrorMessage(`Error al añadir puerta: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Error en la comunicación con el servidor:', error);
      setErrorMessage(`Error al conectar con el servidor: ${error.message || error}`);
      setStatusMessage(prevMsg => `${prevMsg}\nExcepción: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#ebf5ff', height: '100vh', p: 3, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd', mb: 3 }}>
        Añadir puerta:
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

      <TextField
        fullWidth
        label="Nombre de la puerta"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Dirección"
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Ciudad"
        name="ciudad"
        value={form.ciudad}
        onChange={handleChange}
        sx={{ mb: 2 }}
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

      <Button
        fullWidth
        variant="contained"
        sx={{ bgcolor: '#0d6efd', textTransform: 'none', fontWeight: 'bold' }}
        onClick={handleCrearPuerta}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Crear puerta'}
      </Button>
    </Box>
  );
};

export default AnadirPuerta;
