import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './components/home/HomePage';
import SubjectsPage from './components/subjects/SubjectsPage';
import SubjectDetailsPage from './components/subjects/SubjectDetailsPage';
import AIToolsPage from './components/ai-tools/AIToolsPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/asignaturas/:subjectName" element={<SubjectDetailsPage />} />
            <Route path="/asignaturas" element={<SubjectsPage />} />
            <Route path="/herramientas-ia" element={<AIToolsPage />} />
            <Route path="/iniciar-sesion" element={<LoginPage />} />
            <Route path="/registrarse" element={<RegisterPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
