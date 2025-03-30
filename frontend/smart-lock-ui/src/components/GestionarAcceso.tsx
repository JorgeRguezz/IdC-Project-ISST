import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link, IconButton } from '@mui/material';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';

const GestionarAcceso = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const propiedad = state?.propiedad || {};

  const [huesped, setHuesped] = useState('');
  const [email, setEmail] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');

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

        //3. Asegurarse de que las fechas/horas no estan vacias
        if (!fechaInicio || !fechaFin) {
          alert('Por favor, complete todos los campos.');
          return;
        }
        
        // 4. Crear horario
        console.log("Inicio:", `${fechaInicio}:00`);	
        console.log("Fin:", `${fechaFin}:00`);

        if (isNaN(new Date(fechaInicio).getTime()) || isNaN(new Date(fechaFin).getTime())) {
          alert('Las fechas y horas proporcionadas no son válidas.');
          return;
        }

        const horario = {
          inicio: `${fechaInicio}:00`,
          fin: `${fechaFin}:00`
        };
        // 5. Construir acceso completo
        const acceso = { huesped, cerradura:{id:cerradura.id,modelo:cerradura.modelo,bloqueada:cerradura.bloqueada,propiedad:{ id: propiedad.id}}, horario };
        // 6. Enviar al backend
        const resA = await fetch('http://localhost:8080/api/accesos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acceso)
      });
      if (resA.ok) {
        alert('✅ Acceso registrado correctamente');
        irAMisPuertas();

      } else {
        const msg = await resA.text();
        alert('❌ Error al registrar acceso: ' + msg);
      }
     } catch (error) {
      console.error(error);
      alert(' Error al conectar con el servidor');
    }
      
  };

  const handleVolver = () => {
    // Mostramos un diálogo de confirmación para volver
    const confirmar = window.confirm("¿Estás seguro de que deseas volver a tus puertas?");
    if (confirmar) {
      navigate(-1);
    }
};

const irAMisPuertas = () => {
    navigate('/propietario-dashboard');
};

    const handleCerrarSesion = () => {
      localStorage.removeItem('usuario');
      navigate('/login');
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

      {/*Body*/}
      <Box
          sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              overflowY: 'auto'
          }}
      >

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
          label="Email del huesped"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Fecha de inicio"
          type="datetime-local"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Fecha de fin"
          type="datetime-local"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
        />

        <Link href="#" underline="hover" sx={{ color: '#0d6efd', mb: 2, display: 'inline-block' }}>
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
    </Box>
  );
};

export default GestionarAcceso;
