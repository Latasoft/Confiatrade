import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bloquesHorariosApi,
  type BloqueListParams,
  type CreateBloqueData,
  type UpdateBloqueData,
  type GenerateBloqueRequest,
} from '../api/bloquesHorariosApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

// Query Keys
export const bloqueKeys = {
  all: ['bloques-horarios'] as const,
  lists: () => [...bloqueKeys.all, 'list'] as const,
  list: (params?: BloqueListParams) => [...bloqueKeys.lists(), params] as const,
  details: () => [...bloqueKeys.all, 'detail'] as const,
  detail: (id: string) => [...bloqueKeys.details(), id] as const,
};

// Queries
export function useBloquesHorarios(params?: BloqueListParams) {
  return useQuery({
    queryKey: bloqueKeys.list(params),
    queryFn: () => bloquesHorariosApi.list(params),
  });
}

export function useBloqueHorario(id: string | undefined) {
  return useQuery({
    queryKey: bloqueKeys.detail(id!),
    queryFn: () => bloquesHorariosApi.getById(id!),
    enabled: !!id,
  });
}

// Mutations
export function useCreateBloque() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateBloqueData) => bloquesHorariosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloqueKeys.lists() });
      addNotification({
        type: 'success',
        message: 'Bloque horario creado exitosamente',
      });
    },
  });
}

export function useUpdateBloque() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBloqueData }) =>
      bloquesHorariosApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bloqueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bloqueKeys.detail(variables.id) });
      addNotification({
        type: 'success',
        message: 'Bloque horario actualizado exitosamente',
      });
    },
  });
}

export function useDeleteBloque() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => bloquesHorariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloqueKeys.lists() });
      addNotification({
        type: 'success',
        message: 'Bloque horario eliminado exitosamente',
      });
    },
  });
}

export function useGenerateBloques() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: GenerateBloqueRequest) => bloquesHorariosApi.generateAuto(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: bloqueKeys.lists() });
      addNotification({
        type: 'success',
        message: `${response.total_creados} bloques horarios generados exitosamente`,
      });
    },
  });
}
