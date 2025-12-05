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
      console.error('Error completo:', error);
      console.error('Response data:', error?.response?.data);
      
      const detail = error?.response?.data?.detail;
      
      let message = 'Error al crear la reunión';
      
      try {
        // Procesar el error según su tipo
        if (detail) {
          if (typeof detail === 'object' && detail !== null) {
            // Caso: {message: "...", details: {...}}
            if ('message' in detail && typeof detail.message === 'string') {
              message = detail.message;
            } else if ('msg' in detail && typeof detail.msg === 'string') {
              message = detail.msg;
            } else {
              // Caso: objeto sin estructura reconocida
              message = JSON.stringify(detail);
            }
          } else if (typeof detail === 'string') {
            // Caso: string directo
            message = detail;
          }
        }
      } catch (parseError) {
        console.error('Error al procesar el mensaje de error:', parseError);
        message = 'Error al crear la reunión';
      }
      
      // Log para debugging
      console.error('Mensaje extraído:', message);
      
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
