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
    staleTime: 30000, // Datos frescos por 30 segundos
    gcTime: 300000, // Cache por 5 minutos
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
    onError: (error: any) => {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      
      let message = 'Error al crear la reunión';
      
      if (status === 409 || (detail && detail.includes('ya tiene una reunión'))) {
        message = detail || 'Una o ambas empresas ya tienen reunión en este bloque';
      } else if (status === 422) {
        message = detail || 'Datos inválidos';
      } else if (status === 404) {
        message = detail || 'Recurso no encontrado';
      } else if (detail) {
        message = detail;
      }
      
      addNotification({
        type: 'error',
        message,
        title: 'Error al crear reunión',
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
