import React from 'react';
import { usePermisos } from '@/shared/hooks/usePermisos';

interface PermissionGuardProps {
  permiso: string | string[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permiso,
  fallback = null,
  requireAll = false,
  children,
}) => {
  const { tienePermiso, tieneAlgunPermiso, tieneTodosLosPermisos, loading } = usePermisos();

  if (loading) {
    return null; // O un skeleton loader
  }

  let tieneAcceso = false;

  if (typeof permiso === 'string') {
    tieneAcceso = tienePermiso(permiso);
  } else {
    tieneAcceso = requireAll
      ? tieneTodosLosPermisos(permiso)
      : tieneAlgunPermiso(permiso);
  }

  if (!tieneAcceso) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
