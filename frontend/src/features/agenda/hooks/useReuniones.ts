import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reunionesApi, type ReunionListParams, type CreateReunionData, type UpdateReunionData } from '../api/reunionesApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

// Query Keys
export const reunionKeys = {
  all: ['reuniones'] as const,
  lists: () => [...reunionKeys.all, 'list'] as const,
  list: (params?: ReunionListParams) => [...reunionKeys.lists(), params] as const,
  details: () => [...reunionKeys.all, 'detail'] as const,
  detail: (id: string) => [...reunionKeys.details(), id] as const,
};

// Queries
export function useReuniones(params?: ReunionListParams) {
  return useQuery({
    queryKey: reunionKeys.list(params),
    queryFn: () => reunionesApi.list(params),
  });
}

export function useReunion(id: string | undefined) {
  return useQuery({
    queryKey: reunionKeys.detail(id!),
    queryFn: () => reunionesApi.getById(id!),
    enabled: !!id,
  });
}

// Mutations
export function useCreateReunion() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateReunionData) => reunionesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reunionKeys.lists() });
      addNotification({
        type: 'success',
        message: 'Reunión creada exitosamente',
      });
    },
  });
}

export function useUpdateReunion() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReunionData }) =>
      reunionesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reunionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reunionKeys.detail(variables.id) });
      addNotification({
        type: 'success',
        message: 'Reunión actualizada exitosamente',
      });
    },
  });
}

export function useDeleteReunion() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => reunionesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reunionKeys.lists() });
      addNotification({
        type: 'success',
        message: 'Reunión eliminada exitosamente',
      });
    },
  });
}
