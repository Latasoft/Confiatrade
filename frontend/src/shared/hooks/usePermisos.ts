import { useMisPermisos } from '@/features/roles/hooks/useOrganizadores';
import { Permiso } from '@/shared/types/roles';

export const usePermisos = () => {
  const { data, isLoading, error } = useMisPermisos();

  const permisos = data?.permisos.map((p) => p.nombre) || [];
  const permisosDetalle = data?.permisos || [];

  const tienePermiso = (permiso: string): boolean => {
    // Administradores tienen todos los permisos
    if (permisos.includes('*')) return true;
    return permisos.includes(permiso);
  };

  const tieneAlgunPermiso = (permisosList: string[]): boolean => {
    if (permisos.includes('*')) return true;
    return permisosList.some((p) => permisos.includes(p));
  };

  const tieneTodosLosPermisos = (permisosList: string[]): boolean => {
    if (permisos.includes('*')) return true;
    return permisosList.every((p) => permisos.includes(p));
  };

  const permisosPorModulo = (): Record<string, Permiso[]> => {
    return permisosDetalle.reduce((acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {} as Record<string, Permiso[]>);
  };

  return {
    permisos,
    permisosDetalle,
    loading: isLoading,
    error: error ? String(error) : null,
    tienePermiso,
    tieneAlgunPermiso,
    tieneTodosLosPermisos,
    permisosPorModulo,
  };
};
