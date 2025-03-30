import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link, IconButton } from '@mui/material';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';

const GestionarToken = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const propiedad = state?.propiedad || {};

  const [fechaFin, setFechaFin] = useState('');
  const [usosMaximos, setUsosMaximos] = useState('');
  const [codigo, setCodigo] = useState('');

  const handleCrearToken = async () => {
   
    try {
        
      // 1. Buscar cerradura de la propiedad
      const resC = await fetch(`http://localhost:8080/api/cerraduras/propiedad/${propiedad.id}`);
      if (!resC.ok) return alert('Cerradura no asignada a esta propiedad');
      //Cerraduras es un array ya que una propiedad puede tener más de una
      const cerraduras = await resC.json();
      //Cojo la primera cerradura porque al pasar el objeto al backend no puede ser un array, tiene que ser un json
      const cerradura = cerraduras[0];

      let repetido = true;
      
      // 2. Crear horario
      if (isNaN(new Date(fechaFin).getTime())) {
        alert('Las fechas y horas proporcionadas no son válidas.');
        return;
      }
      const fechaExpiracion = `${fechaFin}:00`;
      console.log("Fin:", `${fechaExpiracion}`);

      // 3. Poner el maximo de usos a 0 si no se ha introducido nada
      if (usosMaximos === '') {
        setUsosMaximos('0');
      }

      // 4. Bucle para repetir la creación del código si está repetido
      while (repetido) {
        //let code = (Math.floor(Math.random() * 4) + 1).toString(); //para pruebas, genera tokens con valores del 1, 2, 3 o 4 para comprobar el funcionamiento si se repiten
        let code = generateRandomString();

        // 4.1. Construir token completo
        const token = { codigo:code, fechaExpiracion, usosMaximos, cerradura:{id:cerradura.id,modelo:cerradura.modelo,bloqueada:cerradura.bloqueada,propiedad:{ id: propiedad.id}} };
        
        // 4.2. Enviar al backend
        const resA = await fetch('http://localhost:8080/api/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(token)
        });
        if (resA.ok) {
          alert('✅ Token registrado correctamente');
          repetido = false;
          irAMisPuertas();
        } else if (resA.status === 462) {
          repetido = true;
        } else {
          const msg = await resA.text();
          alert('❌ Error al registrar token: ' + msg);
        }
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

  const generateRandomString = () => {
    const length = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log('Codigo Token:' + result)
    return result;
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
          Generar token para:
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{propiedad.nombre}</Typography>
        <Typography variant="body1" sx={{ mb: 3, textDecoration: 'underline', color: '#0d6efd' }}>
          {propiedad.direccion}
        </Typography>

        <TextField
          label="Número de usos máximos (dejar en blanco para ilimitado)"
          type="number"
          value={usosMaximos}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setUsosMaximos(value);
            }
          }}
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
          onClick={handleCrearToken}
        >
          Registrar token
        </Button>
      </Box>
    </Box>
  );
};

export default GestionarToken;
