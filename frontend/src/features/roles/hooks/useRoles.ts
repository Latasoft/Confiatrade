import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRol,
  crearRol,
  actualizarRol,
  eliminarRol,
  verificarPuedeEliminarRol,
  asignarPermisosARol,
  removerPermisosDeRol,
  getPermisos,
  getPermisosPorModulo,
} from '../api/rolesApi';
import { useNotificationStore } from '@/shared/store/notificationStore';
import { CrearRolRequest, ActualizarRolRequest } from '@/shared/types/roles';

// ============================================
// HOOKS PARA ROLES
// ============================================

export const useRoles = (activo?: boolean) => {
  return useQuery({
    queryKey: ['roles', activo],
    queryFn: () => getRoles(activo),
  });
};

export const useRol = (rolId: string | undefined) => {
  return useQuery({
    queryKey: ['rol', rolId],
    queryFn: () => getRol(rolId!),
    enabled: !!rolId,
  });
};

export const useVerificarPuedeEliminarRol = (rolId: string | undefined) => {
  return useQuery({
    queryKey: ['verificar-eliminar-rol', rolId],
    queryFn: () => verificarPuedeEliminarRol(rolId!),
    enabled: false, // Solo se ejecutará manualmente
  });
};

export const useCrearRol = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (data: CrearRolRequest) => crearRol(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Rol creado',
        message: 'El rol se ha creado correctamente',
        duration: 4000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Error al crear el rol';
      addNotification({
        type: 'error',
        title: 'Error al crear',
        message: errorMessage,
        duration: 6000,
      });
    },
  });
};

export const useActualizarRol = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ rolId, data }: { rolId: string; data: ActualizarRolRequest }) =>
      actualizarRol(rolId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rol', variables.rolId] });
      addNotification({
        type: 'success',
        title: 'Rol actualizado',
        message: 'Los cambios se han guardado correctamente',
        duration: 4000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Error al actualizar el rol';
      addNotification({
        type: 'error',
        title: 'Error al actualizar',
        message: errorMessage,
        duration: 6000,
      });
    },
  });
};

export const useEliminarRol = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (rolId: string) => eliminarRol(rolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Rol eliminado',
        message: 'El rol se ha eliminado correctamente',
        duration: 4000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Error al eliminar el rol';
      addNotification({
        type: 'error',
        title: 'Error al eliminar',
        message: errorMessage,
        duration: 6000,
      });
    },
  });
};

export const useAsignarPermisosARol = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ rolId, permisosIds }: { rolId: string; permisosIds: string[] }) =>
      asignarPermisosARol(rolId, permisosIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rol', variables.rolId] });
      addNotification({
        type: 'success',
        message: 'Permisos asignados exitosamente',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al asignar permisos',
      });
    },
  });
};

export const useRemoverPermisosDeRol = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ rolId, permisosIds }: { rolId: string; permisosIds: string[] }) =>
      removerPermisosDeRol(rolId, permisosIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rol', variables.rolId] });
      addNotification({
        type: 'success',
        message: 'Permisos removidos exitosamente',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al remover permisos',
      });
    },
  });
};

// ============================================
// HOOKS PARA PERMISOS
// ============================================

export const usePermisos = (modulo?: string, activo?: boolean) => {
  return useQuery({
    queryKey: ['permisos', modulo, activo],
    queryFn: () => getPermisos(modulo, activo),
  });
};

export const usePermisosPorModulo = () => {
  return useQuery({
    queryKey: ['permisos-por-modulo'],
    queryFn: () => getPermisosPorModulo(),
  });
};
