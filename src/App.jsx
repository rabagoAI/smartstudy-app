// src/App.jsx - CON MAPAS MENTALES AGREGADO

import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Landing from './components/home/Landing'; // Landing estática para carga rápida
import TourGuide from './components/common/TourGuide';

// Lazy Loading de rutas para optimizar bundle inicial
const HomePage = React.lazy(() => import('./components/home/HomePage'));
const SubjectsPage = React.lazy(() => import('./components/subjects/SubjectsPage'));
const SubjectDetailsPage = React.lazy(() => import('./components/subjects/SubjectDetailsPage'));
const AIToolsPage = React.lazy(() => import('./components/ai-tools/AIToolsPage'));
const MindMapGenerator = React.lazy(() => import('./components/ai-tools/MindMapGenerator'));
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./components/auth/RegisterPage'));
const ProfilePage = React.lazy(() => import('./components/ProfilePage'));
const ResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const UploadForm = React.lazy(() => import('./components/admin/UploadForm'));
const AIHistoryPage = React.lazy(() => import('./components/ai-tools/AIHistoryPage'));
const EducationalChat = React.lazy(() => import('./components/ai-tools/EducationalChat'));
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
                <Route path="/mapas-mentales" element={<MindMapGenerator />} />
                <Route path="/historial-ia" element={<AIHistoryPage />} />
                <Route path="/chat-educativo" element={<EducationalChat />} />
              </Route>
              {/* Rutas de admin - solo usuarios con admin: true en Firestore */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/upload" element={<UploadForm />} />
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