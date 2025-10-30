// src/App.jsx - VERSIÓN LIMPIA SIN CONFLICTOS

import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import Landing from './components/home/Landing';
import HomePage from './components/home/HomePage';
import SubjectsPage from './components/subjects/SubjectsPage';
import SubjectDetailsPage from './components/subjects/SubjectDetailsPage';
import AIToolsPage from './components/ai-tools/AIToolsPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ResetPassword from './components/auth/ResetPassword';
import UploadForm from './components/admin/UploadForm';
import TourGuide from './components/common/TourGuide';
import AIHistoryPage from './components/ai-tools/AIHistoryPage';
import EducationalChat from './components/ai-tools/EducationalChat';
import './App.css';

// Loading component para Suspense
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '24px',
    }}>
      Cargando...
    </div>
  );
}

function AppContent() {
  const { loading, currentUser } = useAuth();

  // Trackear page views cuando cambia la ruta
  useEffect(() => {
    console.log('📄 Página actual:', window.location.pathname);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        {currentUser && <Header />}
        
        <main>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Landing page - pública */}
              <Route path="/" element={<Landing />} />
              
              {/* Rutas de autenticación - públicas */}
              <Route path="/iniciar-sesion" element={<LoginPage />} />
              <Route path="/registrarse" element={<RegisterPage />} />
              <Route path="/restablecer-contrasena" element={<ResetPassword />} />

              {/* Rutas privadas - solo usuarios logueados */}
              <Route element={<PrivateRoute />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<HomePage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/asignaturas" element={<SubjectsPage />} />
                <Route path="/asignaturas/:subjectName" element={<SubjectDetailsPage />} />
                <Route path="/herramientas-ia" element={<AIToolsPage />} />
                <Route path="/admin/upload" element={<UploadForm />} />
                <Route path="/historial-ia" element={<AIHistoryPage />} />
                <Route path="/chat-educativo" element={<EducationalChat />} />
              </Route>
            </Routes>
          </Suspense>
        </main>

        {currentUser && <Footer />}
        <TourGuide />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;