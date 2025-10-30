// src/components/ProfilePage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
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
        image="https://res.cloudinary.com/ds7shn66t/image/upload/v1759232770/Banner_Producto_del_Dia_Promocion_Cafe_Azul_vi0xs4.jpg"
        url="https://www.smartstudia.com/perfil"
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