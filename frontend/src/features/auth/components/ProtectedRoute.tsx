import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useVerificarToken } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'empresa')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { isLoading } = useVerificarToken();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
