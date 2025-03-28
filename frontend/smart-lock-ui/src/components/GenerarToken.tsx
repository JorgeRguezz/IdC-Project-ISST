import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress
} from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Propiedad {
  id: number;
  nombre?: string;
  direccion: string;
}

export default function GenerarToken() {
  const location = useLocation();
  const navigate = useNavigate();

  const propiedad: Propiedad | undefined = location.state?.propiedad;
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [unaVez, setUnaVez] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerarToken = async () => {
    setLoading(true);
    setError("");
  
    try {
      // 1. Validaciones básicas
      if (!propiedad?.id) {
        throw new Error("No se ha seleccionado una propiedad válida");
      }
  
      if (!fechaInicio || !fechaFin) {
        throw new Error("Debes especificar ambas fechas");
      }
  
      // 2. Preparar datos para el servidor
      const tokenData = {
        cerraduraId: propiedad.id,
        fechaInicio: new Date(fechaInicio).toISOString().split('.')[0], // Formato: YYYY-MM-DDTHH:mm:ss
        fechaFin: new Date(fechaFin).toISOString().split('.')[0],
        unaVez
      };
  
      console.log("Enviando datos al servidor:", tokenData); // Para depuración
  
      // 3. Hacer la petición
      const response = await fetch("http://localhost:8080/api/tokens/generar", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(tokenData),
      });
  
      // 4. Manejar la respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error del servidor:", errorData);
        throw new Error(
          errorData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }
  
      // 5. Procesar respuesta exitosa
      const token = await response.json();
      console.log("Token generado:", token); // Para depuración
      
      navigate("/token-generado", { 
        state: { 
          token: token,
          propiedad: propiedad 
        } 
      });
  
    } catch (error) {
      // 6. Manejo detallado de errores
      let errorMessage = "Error al comunicarse con el servidor";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      console.error("Error completo:", error);
      
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        bgcolor: "#e3f2fd",
        minHeight: "100vh",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          alignSelf: "flex-start",
          mb: 2,
          color: "#0d6efd",
          fontWeight: "medium",
        }}
      >
        Volver
      </Button>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Generar token de:
      </Typography>

      {propiedad && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {propiedad.nombre || `Propiedad #${propiedad.id}`}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {propiedad.direccion}
          </Typography>
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Fecha de inicio"
        type="datetime-local"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Fecha de fin"
        type="datetime-local"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={unaVez}
            onChange={(e) => setUnaVez(e.target.checked)}
          />
        }
        label="Válido 1 sola vez"
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleGenerarToken}
        disabled={loading}
        sx={{
          bgcolor: "#0d6efd",
          fontWeight: "bold",
          borderRadius: 2,
          mt: 1,
          "&:hover": {
            bgcolor: "#0b5ed7",
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Generar token"}
      </Button>
    </Box>
  );
}

