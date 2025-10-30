// src/components/auth/PrivateRoute.js

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/iniciar-sesion" />;
};

export default PrivateRoute;