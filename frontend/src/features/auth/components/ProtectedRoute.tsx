import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'empresa' | 'organizador')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated, 'user:', user?.email, 'rol:', user?.rol);
  console.log('[ProtectedRoute] allowedRoles:', allowedRoles);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    // Si el rol es 'admin', 'empresa' u 'organizador', verificar que esté en allowedRoles
    // Si es otro rol personalizado, permitir acceso (se controlará con PermissionGuard)
    const knownRoles = ['admin', 'empresa', 'organizador'];
    
    if (knownRoles.includes(user.rol) && !allowedRoles.includes(user.rol as any)) {
      // Si es un rol conocido pero no está permitido, redirigir
      const redirectPath = user.rol === 'empresa' ? '/empresa/dashboard' : '/';
      console.log('[ProtectedRoute] Rol conocido no permitido, redirigiendo a:', redirectPath);
      return <Navigate to={redirectPath} replace />;
    }
    
    // Si es rol personalizado, permitir pasar (PermissionGuard controlará el acceso)
    if (!knownRoles.includes(user.rol)) {
      console.log('[ProtectedRoute] Rol personalizado detectado:', user.rol, '- permitiendo acceso');
    }
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    // Redirigir según el rol
    const redirectPath = user.rol === 'empresa' ? '/empresa/dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
