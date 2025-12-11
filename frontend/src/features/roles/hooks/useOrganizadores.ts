import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrganizadores,
  crearOrganizador,
  asignarRolAUsuario,
  activarDesactivarUsuario,
  eliminarOrganizador,
  getMisPermisos,
  getPermisosUsuario,
} from '../api/rolesApi';
import { useNotificationStore } from '@/shared/store/notificationStore';
import { CrearOrganizadorRequest } from '@/shared/types/roles';

export const useOrganizadores = (activo?: boolean) => {
  return useQuery({
    queryKey: ['organizadores', activo],
    queryFn: () => getOrganizadores(activo),
  });
};

export const useCrearOrganizador = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (data: CrearOrganizadorRequest) => crearOrganizador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizadores'] });
      addNotification({
        type: 'success',
        message: 'Usuario organizador creado exitosamente',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al crear organizador',
      });
    },
  });
};

export const useAsignarRolAUsuario = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ usuarioId, rolId }: { usuarioId: string; rolId: string }) =>
      asignarRolAUsuario(usuarioId, rolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizadores'] });
      addNotification({
        type: 'success',
        message: 'Rol asignado exitosamente',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al asignar rol',
      });
    },
  });
};

export const useActivarDesactivarUsuario = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ usuarioId, activo }: { usuarioId: string; activo: boolean }) =>
      activarDesactivarUsuario(usuarioId, activo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizadores'] });
      addNotification({
        type: 'success',
        message: `Usuario ${variables.activo ? 'activado' : 'desactivado'} exitosamente`,
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message:
          error.response?.data?.detail || 'Error al cambiar estado del usuario',
      });
    },
  });
};

export const useMisPermisos = () => {
  return useQuery({
    queryKey: ['mis-permisos'],
    queryFn: () => getMisPermisos(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const usePermisosUsuario = (usuarioId: string | undefined) => {
  return useQuery({
    queryKey: ['permisos-usuario', usuarioId],
    queryFn: () => getPermisosUsuario(usuarioId!),
    enabled: !!usuarioId,
  });
};

// Hook para eliminar permanentemente un organizador
export const useEliminarOrganizador = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => eliminarOrganizador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizadores'] });
      addNotification({
        type: 'success',
        title: 'Organizador eliminado',
        message: 'El usuario ha sido eliminado permanentemente del sistema',
        duration: 4000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Error al eliminar organizador';
      addNotification({
        type: 'error',
        title: 'Error al eliminar',
        message: errorMessage,
        duration: 6000,
      });
    },
  });
};
export const useCambiarEstadoOrganizador = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      activarDesactivarUsuario(id, activo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizadores'] });
      addNotification({
        type: 'success',
        message: `Organizador ${variables.activo ? 'activado' : 'desactivado'} exitosamente`,
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al cambiar estado',
      });
    },
  });
};

export const useAsignarRolOrganizador = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, rol_id }: { id: string; rol_id: string }) =>
      asignarRolAUsuario(id, rol_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizadores'] });
      addNotification({
        type: 'success',
        message: 'Rol asignado exitosamente',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Error al asignar rol',
      });
    },
  });
};
