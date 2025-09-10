import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import HomePage from './components/home/HomePage';
import SubjectsPage from './components/subjects/SubjectsPage';
import SubjectDetailsPage from './components/subjects/SubjectDetailsPage';
import AIToolsPage from './components/ai-tools/AIToolsPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ResetPassword from './components/auth/ResetPassword';

import './App.css';

// Componente que contiene el enrutamiento y la lógica de renderizado
// Condicional según el estado de carga
function AppContent() {
  const { loading } = useAuth(); // Obtiene el estado de carga

  // Si está cargando, muestra una pantalla de carga simple
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        Cargando...
      </div>
    );
  }

  // Una vez que la carga ha terminado, renderiza el contenido de la aplicación
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/iniciar-sesion" element={<LoginPage />} />
            <Route path="/registrarse" element={<RegisterPage />} />
            <Route path="/restablecer-contrasena" element={<ResetPassword />} />

            <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/asignaturas" element={<PrivateRoute><SubjectsPage /></PrivateRoute>} />
            <Route path="/asignaturas/:subjectName" element={<PrivateRoute><SubjectDetailsPage /></PrivateRoute>} />
            <Route path="/herramientas-ia" element={<PrivateRoute><AIToolsPage /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// El componente principal App ahora solo envuelve a AppContent con AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
