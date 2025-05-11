import React from 'react';
import { useNavigate } from 'react-router-dom';

const Configuracion: React.FC = () => {
  const navigate = useNavigate();

  // Obtener usuario desde localStorage
  const usuarioStr = localStorage.getItem('usuario') || '{}';
  const usuario = JSON.parse(usuarioStr);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#E4F4FF',
      padding: '20px',
      minHeight: '100vh',
    },
    topBar: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#007bff',
      fontSize: '16px',
      cursor: 'pointer',
      marginRight: '10px',
    },
    title: {
      fontSize: '20px',
      margin: '0',
      color: '#333',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#0d6efd',
      marginBottom: '15px',
    },
    userInfo: {
      marginBottom: '20px',
    },
    infoItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px',
      backgroundColor: '#f1f9ff',
      borderRadius: '4px',
      marginBottom: '10px',
      border: '1px solid #d1e7ff',
    },
    infoLabel: {
      color: '#555',
      fontWeight: 'bold',
    },
    infoValue: {
      color: '#333',
    },
    supportSection: {
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f1f9ff',
      borderRadius: '4px',
      border: '1px solid #d1e7ff',
    },
    supportLink: {
      color: '#007bff',
      textDecoration: 'none',
    },
    logoutButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1 style={styles.title}>Configuración</h1>
      </div>

      <div>
        <h2 style={styles.sectionTitle}>Información del usuario</h2>
        <div style={styles.userInfo}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Nombre de usuario:</span>
            <span style={styles.infoValue}>{usuario.nombre || 'No disponible'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Email:</span>
            <span style={styles.infoValue}>{usuario.email || 'No disponible'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Rol:</span>
            <span style={styles.infoValue}>{usuario.tipo || 'No disponible'}</span>
          </div>
        </div>

        <div style={styles.supportSection}>
          <h3 style={styles.sectionTitle}>Soporte Técnico</h3>
          <p>Si necesitas ayuda, contacta con nuestro equipo de soporte técnico:</p>
          <a
            href="mailto:soporteIoH@email.com"
            style={styles.supportLink}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            soporteIoH@email.com
          </a>
        </div>

        <button
          id='logoutButton'
          style={styles.logoutButton}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Configuracion;
