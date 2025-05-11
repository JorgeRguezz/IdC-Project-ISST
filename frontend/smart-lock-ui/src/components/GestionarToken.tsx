import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link, IconButton } from '@mui/material';
import { useState } from 'react';
// import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import LogoutIcon from '@mui/icons-material/Logout';
import { insertEventToCalendar, deleteEventFromCalendar } from './GoogleAuth';

const GestionarToken = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const propiedad = state?.propiedad || {};

  const [fechaFin, setFechaFin] = useState('');
  const [usosMaximos, setUsosMaximos] = useState('');

  const handleCrearToken = async () => {
   
    try {
        
      // 1. Buscar cerradura de la propiedad
      const resC = await fetch(`https://localhost:8443/api/cerraduras/propiedad/${propiedad.id}`);
      if (!resC.ok) return alert('Cerradura no asignada a esta propiedad');
      //Cerraduras es un array ya que una propiedad puede tener más de una
      const cerraduras = await resC.json();
      //Cojo la primera cerradura porque al pasar el objeto al backend no puede ser un array, tiene que ser un json
      const cerradura = cerraduras[0];

      let repetido = true;
      let fechaExpiracion: string | null = null;
      
      // 2. Crear horario
      if (fechaFin && isNaN(new Date(fechaFin).getTime())) {
        alert('Las fechas y horas proporcionadas no son válidas.');
        return;
      }
      if (!fechaFin) {
        const confirmar = window.confirm("La fecha de expiración no es válida o está vacía, ¿Estás seguro de que deseas crear un token sin fecha de expiración?");
        if (confirmar) {
          // fechaExpiracion remains null
        } else {return;}
      } else {
        fechaExpiracion = `${fechaFin}:00`;
      }
      console.log("Fin:", `${fechaExpiracion}`);

      // 3. Poner el maximo de usos a 0 si no se ha introducido nada
      // Usaremos una variable local para asegurar que el valor correcto se usa en esta operación
      let currentUsosMaximos = usosMaximos;
      if (usosMaximos === '') {
        currentUsosMaximos = '0';
      }

      // 4. Bucle para repetir la creación del código si está repetido
      while (repetido) {
        //let code = (Math.floor(Math.random() * 4) + 1).toString(); //para pruebas, genera tokens con valores del 1, 2, 3 o 4 para comprobar el funcionamiento si se repiten
        let code = generateRandomString();

        // 4.1. Construir token completo
        const token = { codigo:code, fechaExpiracion, usosMaximos: currentUsosMaximos, cerradura:{id:cerradura.id,modelo:cerradura.modelo,bloqueada:cerradura.bloqueada,propiedad:{ id: propiedad.id}} };
        
        // 4.2. Enviar al backend
        const resA = await fetch('https://localhost:8443/api/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(token)
        });
        if (resA.ok) {
          repetido = false; // Salir del bucle si el token se creó bien

          // Crear evento para Google Calendar
          const evento = {
            summary: `Token para ${propiedad.nombre}: ${code}`,
            description: `Token: ${code}. Usos: ${currentUsosMaximos === '0' ? 'Ilimitados' : currentUsosMaximos}. ${fechaExpiracion ? `Expira: ${new Date(fechaExpiracion).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}` : 'No expira por fecha.'}`,
            start: {
              dateTime: new Date().toISOString(), // Momento de creación del token
              timeZone: 'Europe/Madrid',
            },
            end: {
              dateTime: fechaExpiracion
                ? new Date(fechaExpiracion).toISOString()
                : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // Si no hay fecha de expiración, el evento dura 1 hora
              timeZone: 'Europe/Madrid',
            }
          };

          try {
            await insertEventToCalendar(evento);
            alert(`✅ Token creado correctamente: ${code}\nEl evento ha sido añadido a tu Google Calendar.`);
          } catch (e) {
            console.error('Error al añadir evento al calendario:', e);
            alert(`✅ Token creado correctamente: ${code}\nPero no se pudo añadir el evento al calendario. Por favor, revisa tu conexión o configuración de Google Calendar.`);
          }
          
          irAMisPuertas();
        } else if (resA.status === 462) {
          repetido = true; // El código estaba repetido, el bucle continuará
        } else {
          const msg = await resA.text();
          alert('❌ Error al registrar token: ' + msg);
          repetido = false; // Salir del bucle en caso de otros errores
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
    const minLength = 6; // Longitud mínima del código
    const maxLength = 9; // Longitud máxima del código
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const characters = '0123456789'; // Solo números
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log('Codigo Token:' + result);
    return result;
  };

  const irAMisPuertas = () => {
      navigate('/propietario-dashboard');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#ebf5ff',
        px: 2,
        py: 2,
        overflowY: 'auto'
      }}
    >
      
      {/* Header */}

      <Box
        sx={{
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => handleVolver()}
          sx={{
            alignSelf: 'flex-start',
            textTransform: 'none',
            fontWeight: 'medium'
          }}
        >
          Volver
        </Button>
      </Box>

      {/*Body*/}

      <Typography variant="h5" sx={{ mt: 2, mb: 3, color: '#0d6efd', fontWeight: 'bold' }}>
        Generar token para:
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color='black'>{propiedad.nombre}</Typography>
      <Typography variant="body1" sx={{ mb: 3, textDecoration: 'underline', color: '#0d6efd' }}>
        {propiedad.direccion}
      </Typography>

      <TextField
        id='numeroUsos'
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
      />

      <TextField
        id='fechaFin'
        label="Fecha de fin"
        type="datetime-local"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
        InputLabelProps={{ shrink: true }}
      />

      {/* <Link href="#" underline="hover" sx={{ color: '#0d6efd', mb: 2, display: 'inline-block' }}>
        Vincular con Google Calendar
      </Link> */}


      <Button
        id='crearTokenButton'
        fullWidth
        variant="contained"
        sx={{ bgcolor: '#0d6efd', textTransform: 'none', fontWeight: 'bold', mt: 2 }}
        onClick={handleCrearToken}
      >
        Registrar token
      </Button>
    </Box>
  );
};

export default GestionarToken;
