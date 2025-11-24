import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'empresa')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    // Si no tiene el rol adecuado, redirigir a su dashboard correspondiente
    return <Navigate to={user.rol === 'admin' ? '/' : '/empresa/dashboard'} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    // Redirigir según el rol
    return <Navigate to={user.rol === 'admin' ? '/' : '/empresa/dashboard'} replace />;
  }

  return <Outlet />;
}
