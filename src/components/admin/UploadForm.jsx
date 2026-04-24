// src/components/admin/UploadForm.js

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ALLOWED_TYPES = {
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  exam: ['application/pdf'],
};
const MAX_SIZE_MB = 100;

const UploadForm = () => {
  const { isAdmin } = useAuth();

  // Segunda barrera: si por algún motivo AdminRoute falla, el componente lo bloquea
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [contentType, setContentType] = useState('pdf'); // Nuevo estado: 'pdf', 'video', 'exam'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 1. Obtener la lista de asignaturas de Firestore al cargar el componente
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        const subjectsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
        setSubjects(subjectsList);
        if (subjectsList.length > 0) {
          setSelectedSubjectId(subjectsList[0].id);
        }
      } catch (err) {
        console.error("Error al obtener las asignaturas:", err);
        setError('Error al cargar las asignaturas. Inténtalo más tarde.');
      }
    };
    fetchSubjects();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedMimes = ALLOWED_TYPES[contentType] || [];
    if (!allowedMimes.includes(selected.type)) {
      setError(`Tipo de archivo no permitido para "${contentType}". Formatos válidos: ${allowedMimes.join(', ')}`);
      e.target.value = '';
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera el tamaño máximo permitido (${MAX_SIZE_MB} MB).`);
      e.target.value = '';
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!file || !title || !selectedSubjectId) {
      setError('Por favor, completa todos los campos y selecciona una asignatura.');
      setLoading(false);
      return;
    }

    try {
      // 1. Subir el archivo a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'unsigned_pdfs');

      let resourceType = 'raw';
      if (file.type.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.type === 'application/pdf') {
        resourceType = 'raw';
      } else if (file.type.startsWith('image/')) {
        resourceType = 'image';
      }

      // ✅ Corregido: Eliminados espacios extra en la URL
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        formData
      );

      const downloadURL = cloudinaryResponse.data.secure_url;

      // 2. Guardar los datos del contenido en Firestore
      await addDoc(collection(db, 'subjects', selectedSubjectId, 'content'), {
        title: title,
        description: description,
        type: contentType, // ✅ Usa el tipo seleccionado por el usuario
        url: downloadURL,
        isPremium: isPremium,
        createdAt: serverTimestamp(),
      });

      setMessage('¡Contenido subido exitosamente!');
      setFile(null);
      setTitle('');
      setDescription('');
      setIsPremium(false);
      setContentType('pdf'); // Reset al valor por defecto

    } catch (err) {
      console.error("Error al subir el contenido:", err);
      setError('Hubo un error al subir el contenido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2>Subir Contenido</h2>
        <form onSubmit={handleSubmit}>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          {/* Selector de asignaturas */}
          <div className="form-group">
            <label htmlFor="subject-select">Asignatura:</label>
            <select
              id="subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Selecciona una asignatura</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de tipo de contenido */}
          <div className="form-group">
            <label htmlFor="content-type">Tipo de contenido:</label>
            <select
              id="content-type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              disabled={loading}
              required
            >
              <option value="pdf">📄 Apunte / Resumen (PDF)</option>
              <option value="video">🎥 Video explicativo</option>
              <option value="exam">📝 Examen resuelto</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Describe brevemente el contenido..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Seleccionar archivo:</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              disabled={loading}
              required
            />
            <p className="file-hint">
              {contentType === 'video' ? 'Formatos soportados: MP4, WebM, OGG' : 'Formato soportado: PDF'}
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                disabled={loading}
              />
              💎 Contenido Premium (solo para usuarios suscritos)
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Subiendo...' : 'Subir Contenido'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;