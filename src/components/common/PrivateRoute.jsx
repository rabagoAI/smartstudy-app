// src/components/common/PrivateRoute.js

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useAuth() || { currentUser: null, loading: true };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/iniciar-sesion" />;
  }

  return <Outlet />;
};

export default PrivateRoute;