import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AnadirPuerta = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [imagenFile, setImagenFile] = useState<File | null>(null);


  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
   // piso: '',
    //puerta: '',
    ciudad: '',
   // imagen: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCrearPuerta = async () => {
    const direccionCompleta = `${form.direccion}
     , ${form.ciudad}`;
    const propiedad = {
      nombre: form.nombre,
      direccion: direccionCompleta,
      //imagen: form.imagen,
      propietario: { id: usuario.id }
    };
    //////////////////////
    const formData = new FormData();
    formData.append("propiedad", JSON.stringify(propiedad));
    if (imagenFile) formData.append("imagen", imagenFile);


    try {
     // const response = await fetch('http://localhost:8080/api/propiedades', {
       // method: 'POST',
        //headers: { 'Content-Type': 'application/json' },
        //body: JSON.stringify(propiedad)
      //});
      const response = await fetch("http://localhost:8080/api/propiedades", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert(' Puerta añadida correctamente');
        navigate('/propietario-dashboard');
      } else {
        const msg = await response.text();
        alert(' Error al añadir puerta: ' + msg);
      }
    } catch (error) {
      console.error(error);
      alert(' Error al conectar con el servidor');
    }
  };

  return (
    <Box sx={{ bgcolor: '#ebf5ff', height: '100vh', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd', mb: 3 }}>
        Añadir puerta:
      </Typography>

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
      {/*
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Piso" name="piso" value={form.piso} onChange={handleChange} sx={{ flex: 1 }} />
        <TextField label="Puerta" name="puerta" value={form.puerta} onChange={handleChange} sx={{ flex: 1 }} />
      </Box>
        */}
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
      >
        Crear puerta
      </Button>
    </Box>
  );
};

export default AnadirPuerta;
