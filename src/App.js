// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './components/home/HomePage';
import SubjectsPage from './components/subjects/SubjectsPage';
import SubjectDetailsPage from './components/subjects/SubjectDetailsPage';
import AIToolsPage from './components/ai-tools/AIToolsPage';

import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/asignaturas/:subjectName" element={<SubjectDetailsPage />} />
          <Route path="/asignaturas" element={<SubjectsPage />} />
          <Route path="/herramientas-ia" element={<AIToolsPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
