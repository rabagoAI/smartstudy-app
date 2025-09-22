// src/App.js

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
import UploadForm from './components/admin/UploadForm';
import TourGuide from './components/common/TourGuide'; // ✅ Importa el tour
import AIHistoryPage from './components/ai-tools/AIHistoryPage';

import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        Cargando...
      </div>
    );
  }

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

            <Route element={<PrivateRoute />}>
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/asignaturas" element={<SubjectsPage />} />
              <Route path="/asignaturas/:subjectName" element={<SubjectDetailsPage />} />
              <Route path="/herramientas-ia" element={<AIToolsPage />} />
              <Route path="/admin/upload" element={<UploadForm />} />
              <Route path="/historial-ia" element={<AIHistoryPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        <TourGuide /> {/* ✅ Añade el tour aquí */}
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