import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: string[]; // Permisos requeridos (al menos uno)
  requireAll?: boolean; // Si true, requiere todos los permisos; si false, requiere al menos uno
}

export function PermissionGuard({ 
  children, 
  permissions = [], 
  requireAll = false 
}: PermissionGuardProps) {
  const user = useAuthStore((state) => state.user);

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si es admin, permitir acceso a todo
  if (user.rol === 'admin') {
    return <>{children}</>;
  }

  // Si no se especifican permisos, significa que es solo para admin
  // Por lo tanto, bloquear acceso a otros roles
  if (!permissions || permissions.length === 0) {
    // Redirigir según el rol
    if (user.rol === 'empresa') {
      return <Navigate to="/empresa/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Verificar permisos del usuario
  const userPermissions = user.permisos || [];

  const hasPermission = requireAll
    ? permissions.every(p => userPermissions.includes(p))
    : permissions.some(p => userPermissions.includes(p));

  if (!hasPermission) {
    // Redirigir según el rol
    if (user.rol === 'empresa') {
      return <Navigate to="/empresa/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
