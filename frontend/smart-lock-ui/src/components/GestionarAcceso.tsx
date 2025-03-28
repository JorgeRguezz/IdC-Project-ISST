import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Link } from '@mui/material';
import { useState } from 'react';


const GestionarAcceso = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const propiedad = state?.propiedad || {};

  const [huesped, setHuesped] = useState('');
  const [email, setEmail] = useState('');
  const [diaInicio, setDiaInicio] = useState('');
  const [mesInicio, setMesInicio] = useState('');
  const [añoInicio, setAnoInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [minInicio, setMinInicio] = useState('');
  const [diaFin, setDiaFin] = useState('');
  const [mesFin, setMesFin] = useState('');
  const [anoFin, setAnoFin] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [minFin, setMinFin] = useState('');

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
        const fechaInicio = `${añoInicio}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}T${horaInicio}:${minInicio.padStart(2, '0')}`;
        const fechaFin = `${anoFin}-${mesFin.padStart(2, '0')}-${diaFin.padStart(2, '0')}T${horaFin}:${minFin.padStart(2, '0')}`;
        console.log("Inicio:", `${fechaInicio}`);	
        console.log("Fin:", `${fechaFin}`);

        const horario = {
          inicio: `${fechaInicio}`,
          fin: `${fechaFin}`
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
      <Grid container spacing={1} sx={{ mb: 2, ml: 2}}>
      <Grid item xs={1.5}>
          <TextField
        placeholder="hh"
        fullWidth
        value={horaInicio || ''}
        onChange={(e) => {
          let hour = e.target.value.replace(/\D/g, ''); // Allow only numbers
          hour = hour.slice(0, 2); // Limit to 2 digits
          if (hour !== '' && (parseInt(hour) < 0 || parseInt(hour) > 23)) {
        return; // Ignore invalid values
          }
          setHoraInicio(hour);
        }}
        required
          />
        </Grid>
        <Grid item xs="auto">
          <Typography variant="body1" sx={{ textAlign: 'center', lineHeight: '56px' }}>
            :
          </Typography>
        </Grid>
        <Grid item xs={1.5}>
          <TextField
            placeholder="mm"
            fullWidth
            value={minInicio || ''}
            onChange={(e) => {
              let minute = e.target.value.replace(/\D/g, ''); // Allow only numbers
              minute = minute.slice(0, 2); // Limit to 2 digits
              if (minute !== '' && (parseInt(minute) < 0 || parseInt(minute) > 59)) {
          return; // Ignore invalid values
              }
              setMinInicio(minute);
            }}
            required
          />
        </Grid>
        <Grid item xs={1.5} sx={{ ml: 10 }}>
          <TextField
            placeholder="DD"
            fullWidth
            value={diaInicio}
            onChange={(e) => {
              let day = e.target.value.replace(/\D/g, ''); // Allow only numbers
              day = day.slice(0, 2); // Limit to 2 digits
              if (day !== '' && (parseInt(day) < 1 || parseInt(day) > 31)) {
          return; // Ignore invalid values
              }
              setDiaInicio(day);
            }}
            required
          />
        </Grid>
        <Grid item xs="auto">
          <Typography variant="body1" sx={{ textAlign: 'center', lineHeight: '56px' }}>
            /
          </Typography>
        </Grid>
        <Grid item xs={1.5}>
          <TextField
            placeholder="MM"
            fullWidth
            value={mesInicio || ''}
            onChange={(e) => {
              let month = e.target.value.replace(/\D/g, ''); // Allow only numbers
              month = month.slice(0, 2); // Limit to 2 digits
              if (month !== '' && (parseInt(month) < 1 || parseInt(month) > 12)) {
          return; // Ignore invalid values
              }
              setMesInicio(month);
            }}
            required
          />
        </Grid>
        <Grid item xs="auto">
          <Typography variant="body1" sx={{ textAlign: 'center', lineHeight: '56px' }}>
            /
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            placeholder="YYYY"
            fullWidth
            value={añoInicio || ''}
            onChange={(e) => {
              const year = e.target.value.replace(/\D/g, ''); // Allow only numbers
              setAnoInicio(year.slice(0, 4)); // Limit to 4 digits
            }}
            required
          />
        </Grid>
      </Grid>

      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Fecha y hora de salida:</Typography>
      <Grid container spacing={1} sx={{ mb: 2, ml: 2}}>
        <Grid item xs={1.5}>
          <TextField
            placeholder="hh"
            fullWidth
            value={horaFin || ''}
            onChange={(e) => {
              let hour = e.target.value.replace(/\D/g, ''); // Allow only numbers
              hour = hour.slice(0, 2); // Limit to 2 digits
              if (hour !== '' && (parseInt(hour) < 0 || parseInt(hour) > 23)) {
          hour = ''; // Reset to empty if out of range
              }
              setHoraFin(hour);
            }}
            required
          />
        </Grid>
        <Grid item xs="auto">
          <Typography variant="body1" sx={{ textAlign: 'center', lineHeight: '56px' }}>
        :
          </Typography>
        </Grid>
        <Grid item xs={1.5}>
          <TextField
            placeholder="mm"
            fullWidth
            value={minFin || ''}
            onChange={(e) => {
              let minute = e.target.value.replace(/\D/g, ''); // Allow only numbers
              minute = minute.slice(0, 2); // Limit to 2 digits
              if (minute !== '' && (parseInt(minute) < 0 || parseInt(minute) > 59)) {
          minute = ''; // Reset to empty if out of range
              }
              setMinFin(minute);
            }}
            required
          />
        </Grid>
        <Grid item xs={1.5} sx={{ ml: 10 }}>
          <TextField
            placeholder="DD"
            fullWidth
            value={diaFin || ''}
            onChange={(e) => {
              let day = e.target.value.replace(/\D/g, ''); // Allow only numbers
              day = day.slice(0, 2); // Limit to 2 digits
              if (day !== '' && (parseInt(day) < 1 || parseInt(day) > 31)) {
          return; // Ignore invalid values
              }
              setDiaFin(day);
            }}
            required
          />
        </Grid>
        <Grid item xs="auto">
          <Typography variant="body1" sx={{ textAlign: 'center', lineHeight: '56px' }}>
        /
          </Typography>
        </Grid>
        <Grid item xs={1.5}>
          <TextField
            placeholder="MM"
            fullWidth
            value={mesFin || ''}
            onChange={(e) => {
              let month = e.target.value.replace(/\D/g, ''); // Allow only numbers
              month = month.slice(0, 2); // Limit to 2 digits
              if (month !== '' && (parseInt(month) < 1 || parseInt(month) > 12)) {
          return; // Ignore invalid values
              }
              setMesFin(month);
            }}
            required
          />
        </Grid>
        <Grid item xs="auto">
          <Typography variant="body1" sx={{ textAlign: 'center', lineHeight: '56px' }}>
        /
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            placeholder="YYYY"
            fullWidth
            value={anoFin}
            onChange={(e) => {
              const year = e.target.value.replace(/\D/g, ''); // Allow only numbers
              setAnoFin(year.slice(0, 4)); // Limit to 4 digits
            }}
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
