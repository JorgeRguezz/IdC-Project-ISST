import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import TokenAccess from './components/TokenAccess';
import PropietarioDashboard from './components/PropietarioDashboard';
import HuespedDashboard from './components/HuespedDashboard';
import AbrirPuerta from './components/AbrirPuerta';
import AuthGuard from './components/AuthGuard';
import Propiedades from './components/Propiedades';
import MisAccesos from './components/MisAccesos';
import AnadirPuerta from './components/AnadirPuerta';
import GestionarAcceso from './components/GestionarAcceso';
import GestionarToken from './components/GestionarToken';
import AccesosPropietario from './components/AccesosPropietario';
import AccesosPropietarioToken from './components/AccesosPropietarioToken';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/propiedades/anadir" element={<AnadirPuerta />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/token" element={<TokenAccess />} />
          <Route path="/propiedades" element={<Propiedades />} />
          <Route path="/propiedades/gestionar-acceso" element={<GestionarAcceso />} />
          <Route path="/propiedades/gestionar-token" element={<GestionarToken />} />

          <Route
            path="/propietario-dashboard"
            element={
              <AuthGuard userType="PROPIETARIO">
                <PropietarioDashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/accesos-propietario"
            element={
              <AuthGuard userType="PROPIETARIO">
                <AccesosPropietario />
              </AuthGuard>
            }
          />
          <Route
            path="/accesos-propietario/token"
            element={
              <AuthGuard userType="PROPIETARIO">
                <AccesosPropietarioToken />
              </AuthGuard>
            }
          />
          <Route
            path="/huesped-dashboard"
            element={
              <AuthGuard userType="HUESPED">
                <HuespedDashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/mis-accesos"
            element={
              <AuthGuard userType="HUESPED">
                <MisAccesos />
              </AuthGuard>
            }
          />
          <Route
            path="/abrir-puerta/:cerraduraId"
            element={
              <AuthGuard>
                <AbrirPuerta />
              </AuthGuard>
            }
          />
          <Route path="/abrir-puerta/cerradura/:cerraduraId" element={<AbrirPuerta />} />
          {/* Additional routes will be added later */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
