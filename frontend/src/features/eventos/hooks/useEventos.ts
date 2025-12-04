import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventosApi, type CreateEventoData, type UpdateEventoData } from '../api/eventosApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

export const useEventos = (params?: {
  skip?: number;
  limit?: number;
  activo?: boolean;
  estado?: string;
  pais_sede?: string;
}) => {
  return useQuery({
    queryKey: ['eventos', params],
    queryFn: () => eventosApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useEvento = (id: string) => {
  return useQuery({
    queryKey: ['evento', id],
    queryFn: () => eventosApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEvento = () => {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateEventoData) => eventosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      notify({
        type: 'success',
        message: 'Evento creado exitosamente',
      });
    },
    onError: (error: any) => {
      // Solo mostrar error si el interceptor no lo manejó
      const errorMessage = error?.response?.data?.detail || error?.message;
      if (errorMessage && !error?.response?.status) {
        notify({
          type: 'error',
          message: errorMessage,
        });
      }
    },
  });
};

export const useUpdateEvento = () => {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventoData }) =>
      eventosApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento', variables.id] });
      notify({
        type: 'success',
        message: 'Evento actualizado exitosamente',
      });
    },
    onError: (error: any) => {
      // Solo mostrar error si el interceptor no lo manejó
      const errorMessage = error?.response?.data?.detail || error?.message;
      if (errorMessage && !error?.response?.status) {
        notify({
          type: 'error',
          message: errorMessage,
        });
      }
    },
  });
};

export const useDeleteEvento = () => {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => eventosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      notify({
        type: 'success',
        message: 'Evento eliminado exitosamente',
      });
    },
  });
};
