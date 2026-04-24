import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
