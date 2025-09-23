// src/components/ProfilePage.js
import React from 'react';
import { useAuth } from '../AuthContext';
import SEO from './common/SEO'; // ✅ Añade esta línea

const ProfilePage = () => {
  const { userData, currentUser } = useAuth();

  if (!userData || !currentUser) {
    return <div>Cargando datos del perfil...</div>;
  }

  return (
    <>
      {/* ✅ Añade el componente SEO aquí */}
      <SEO
        title="Mi Perfil - SmartStudy"
        description={`Bienvenido, ${userData.email}. Gestiona tu suscripción y revisa tu historial de IA.`}
        image="https://res.cloudinary.com/ds7shn66t/image/upload/v1758618850/DeWatermark.ai_1758546785863_xbsigz.jpg"
        url="https://smartstudy.vercel.app/perfil"
      />

      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Perfil de Usuario</h1>
        <p>Bienvenido, {userData.email}!</p>
        <p>ID de usuario (UID): {currentUser.uid}</p>
        <p>Fecha de registro: {userData.createdAt.toDate().toLocaleDateString()}</p>
      </div>
    </>
  );
};

export default ProfilePage;