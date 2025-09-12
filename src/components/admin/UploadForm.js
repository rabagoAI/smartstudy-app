// src/components/admin/UploadForm.js

import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!file || !title) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    try {
      // 1. Subir el archivo a Cloudinary con el recurso correcto
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'smart_study_upload');

      // Detectar tipo de archivo
      let resourceType = 'raw'; // por defecto
      if (file.type.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.type === 'application/pdf') {
        resourceType = 'raw';
      } else if (file.type.startsWith('image/')) {
        resourceType = 'image';
      }

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        formData
      );

      const downloadURL = cloudinaryResponse.data.secure_url;

      // 2. Guardar los datos del contenido en Firestore
      await addDoc(collection(db, 'subjects', 'biologia', 'content'), {
        title: title,
        description: description,
        type: file.type.startsWith('video/') ? 'video' : 'pdf',
        url: downloadURL,
        isPremium: isPremium,
        createdAt: serverTimestamp(),
      });

      setMessage('¡Contenido subido exitosamente!');
      setFile(null);
      setTitle('');
      setDescription('');
      setIsPremium(false);

    } catch (err) {
      console.error("Error al subir el contenido:", err);
      setError('Hubo un error al subir el contenido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Subir Contenido a Biología</h1>
      <form onSubmit={handleSubmit}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="title">Título:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="file">Seleccionar archivo (PDF o Video):</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            disabled={loading}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              disabled={loading}
            />
            Contenido Premium
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Subiendo...' : 'Subir Contenido'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
