import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link } from '@mui/material';
import { useState } from 'react';
const navigate = useNavigate();

const GestionarAcceso = () => {
  const { state } = useLocation();
  const propiedad = state?.propiedad || {};

  const [huesped, setHuesped] = useState('');
  const [email, setEmail] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('');

  const handleCrearAcceso = async () => {
   
    try {
       /*
        
      const response = await fetch('http://localhost:8080/api/accesos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceso)
      });

      if (response.ok) {
        alert(' Acceso registrado correctamente');
      } else {
        const msg = await response.text();
        alert(' Error al registrar acceso: ' + msg);
      }   */

        // 1. Buscar huésped
        const resH = await fetch(`http://localhost:8080/api/usuarios/email?email=${encodeURIComponent(email)}`);
        if (!resH.ok) return alert('Huésped no encontrado');
         const huesped = await resH.json();

         // 2. Buscar cerradura de la propiedad
        const resC = await fetch(`http://localhost:8080/api/cerraduras/propiedad/${propiedad.id}`);
        if (!resC.ok) return alert('Cerradura no asignada a esta propiedad');
        //Cerraduras es un array ya que una propiedad puede tener más de una
        const cerraduras = await resC.json();
        //Cojo la primera cerradura porque al pasar el objeto al backend no puede ser un array, tiene que ser un json
        const cerradura = cerraduras[0];

        // 3. Crear horario
        console.log("Inicio:", `${fechaInicio}T${horaInicio}`);
        console.log("Fin:", `${fechaFin}T${horaFin}`);

        const horario = {
         inicio: `${fechaInicio}T${horaInicio}`,
         fin: `${fechaFin}T${horaFin}`
        };
        // 4. Construir acceso completo
        const acceso = { huesped, cerradura:{id:cerradura.id,modelo:cerradura.modelo,bloqueada:cerradura.bloqueada,propiedad:{ id: propiedad.id}}, horario };
        // 5. Enviar al backend
        const resA = await fetch('http://localhost:8080/api/accesos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceso)
      });
      if (resA.ok) {
        alert('✅ Acceso registrado correctamente');
        navigate('/PropietarioDashboard');

      } else {
        const msg = await resA.text();
        alert('❌ Error al registrar acceso: ' + msg);
      }
     } catch (error) {
      console.error(error);
      alert(' Error al conectar con el servidor');
    }
      
  };

  return (
    <Box sx={{ bgcolor: '#e3f2fd', minHeight: '100vh', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d6efd', mb: 1 }}>
        Gestionar acceso a:
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{propiedad.nombre}</Typography>
      <Typography variant="body1" sx={{ mb: 3, textDecoration: 'underline', color: '#0d6efd' }}>
        {propiedad.direccion}
      </Typography>
     

      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Email de usuario del huésped:</Typography>
      <TextField
        fullWidth
        placeholder="Escriba el email de usuario"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Fecha y hora de entrada:</Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            placeholder='DD/MM/YYYY'
            fullWidth
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
          placeholder='HH:MM'
          fullWidth
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
          />
        </Grid>
      </Grid>

      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Fecha y hora de salida:</Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            placeholder='DD/MM/YYYY'
            fullWidth
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
          placeholder='HH:MM'
            fullWidth
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            required
          />
        </Grid>
      </Grid>

      <Link href="#" underline="hover" sx={{ color: '#0d6efd', mb: 3, display: 'inline-block' }}>
        Vincular con Google Calendar
      </Link>

      <Button
        fullWidth
        variant="contained"
        sx={{ bgcolor: '#0d6efd', textTransform: 'none', fontWeight: 'bold', mt: 2 }}
        onClick={handleCrearAcceso}
      >
        Registrar acceso
      </Button>
    </Box>
  );
};

export default GestionarAcceso;
