import React from 'react';
import { useAuth } from '../AuthContext'; 

const ProfilePage = () => {
  const { userData, currentUser } = useAuth();

  // Muestra un mensaje de carga si los datos aún no están disponibles
  if (!userData || !currentUser) {
    return <div>Cargando datos del perfil...</div>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Perfil de Usuario</h1>
      <p>Bienvenido, {userData.email}!</p>
      <p>ID de usuario (UID): {currentUser.uid}</p>
      <p>Fecha de registro: {userData.createdAt.toDate().toLocaleDateString()}</p>
      {/* Añade más datos si los guardas en Firestore */}
    </div>
  );
};

export default ProfilePage;