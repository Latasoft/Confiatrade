import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { seguimientoApi, SeguimientoListParams } from '../api/seguimientoApi';
import type { CreateSeguimientoData, UpdateSeguimientoData } from '../api/seguimientoApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

export const seguimientoKeys = {
  all: ['seguimiento'] as const,
  lists: () => [...seguimientoKeys.all, 'list'] as const,
  list: (params?: SeguimientoListParams) =>
    [...seguimientoKeys.lists(), params] as const,
  details: () => [...seguimientoKeys.all, 'detail'] as const,
  detail: (id: string) => [...seguimientoKeys.details(), id] as const,
};

export function useSeguimientos(params?: SeguimientoListParams) {
  return useQuery({
    queryKey: seguimientoKeys.list(params),
    queryFn: () => seguimientoApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useSeguimiento(id: string, enabled = true) {
  return useQuery({
    queryKey: seguimientoKeys.detail(id),
    queryFn: () => seguimientoApi.getById(id),
    enabled: enabled && !!id,
  });
}

export function useCreateSeguimiento() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateSeguimientoData) => seguimientoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.lists() });
      notify({ message: 'Seguimiento creado exitosamente', type: 'success' });
    },
    onError: () => {
      notify({ message: 'Error al crear el seguimiento', type: 'error' });
    },
  });
}

export function useUpdateSeguimiento() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeguimientoData }) =>
      seguimientoApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.detail(variables.id) });
      notify({ message: 'Seguimiento actualizado exitosamente', type: 'success' });
    },
    onError: () => {
      notify({ message: 'Error al actualizar el seguimiento', type: 'error' });
    },
  });
}

export function useDeleteSeguimiento() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => seguimientoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seguimientoKeys.lists() });
      notify({ message: 'Seguimiento eliminado exitosamente', type: 'success' });
    },
    onError: () => {
      notify({ message: 'Error al eliminar el seguimiento', type: 'error' });
    },
  });
}
