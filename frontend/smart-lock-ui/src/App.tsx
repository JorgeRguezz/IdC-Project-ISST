import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import TokenAccess from './components/TokenAccess'
import PropietarioDashboard from './components/PropietarioDashboard'
import HuespedDashboard from './components/HuespedDashboard'
import AbrirPuerta from './components/AbrirPuerta'
import AuthGuard from './components/AuthGuard'
import Propiedades from './components/Propiedades'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/token" element={<TokenAccess />} />
        <Route path="/propiedades" element={<Propiedades/>} />

        <Route
          path="/propietario-dashboard"
          element={
            <AuthGuard userType="propietario">
              <PropietarioDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/huesped-dashboard"
          element={
            <AuthGuard userType="huesped">
              <HuespedDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/abrir-puerta/:propiedadId"
          element={
            <AuthGuard>
              <AbrirPuerta />
            </AuthGuard>
          }
        />
        {/* Additional routes will be added later */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
