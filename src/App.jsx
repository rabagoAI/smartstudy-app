// src/App.js - VERSIÓN ACTUALIZADA CON LANDING

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Landing from './components/home/Landing'; // ✅ NUEVO: Landing page
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

function AppContent() {
  const { loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        Cargando...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* ✅ NUEVO: No mostrar Header/Footer en Landing */}
          {currentUser && <Header />}

          <main>
            <Routes>
              {/* ✅ NUEVA RUTA: Landing page (ruta pública) */}
              <Route path="/" element={<Landing />} />

              {/* Rutas de autenticación (públicas) */}
              <Route path="/iniciar-sesion" element={<LoginPage />} />
              <Route path="/registrarse" element={<RegisterPage />} />
              <Route path="/restablecer-contrasena" element={<ResetPassword />} />

              {/* Rutas privadas (solo usuarios logueados) */}
              <Route element={<PrivateRoute />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<HomePage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/asignaturas" element={<SubjectsPage />} />
                <Route path="/asignaturas/:subjectName" element={<SubjectDetailsPage />} />
                <Route
                  path="/herramientas-ia"
                  element={
                    <ErrorBoundary fullPage={false}>
                      <AIToolsPage />
                    </ErrorBoundary>
                  }
                />
                <Route path="/admin/upload" element={<UploadForm />} />
                <Route path="/historial-ia" element={<AIHistoryPage />} />
                <Route
                  path="/chat-educativo"
                  element={
                    <ErrorBoundary fullPage={false}>
                      <EducationalChat />
                    </ErrorBoundary>
                  }
                />
              </Route>
            </Routes>
          </main>

          {/* ✅ NUEVO: No mostrar Footer en Landing */}
          {currentUser && <Footer />}
          <TourGuide />
        </div>
      </Router>
    </ErrorBoundary>
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