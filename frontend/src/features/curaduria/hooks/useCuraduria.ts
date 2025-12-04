import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { curaduriaApi, type CreateCuraduriaData, type UpdateCuraduriaData } from '../api/curaduriaApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

export const useCuradurias = (params?: { skip?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['curadurias', params],
    queryFn: () => curaduriaApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useCuraduria = (id: string) => {
  return useQuery({
    queryKey: ['curaduria', id],
    queryFn: () => curaduriaApi.getById(id),
    enabled: !!id,
  });
};

export const useCuraduriaByEmpresa = (empresaId: string) => {
  return useQuery({
    queryKey: ['curaduria', 'empresa', empresaId],
    queryFn: () => curaduriaApi.getByEmpresa(empresaId),
    enabled: !!empresaId,
  });
};

export const useCreateCuraduria = () => {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateCuraduriaData) => curaduriaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curadurias'] });
      notify({
        type: 'success',
        message: 'Curaduría creada exitosamente',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error al crear la curaduría';
      notify({
        type: 'error',
        message: errorMessage,
        title: 'Error al crear curaduría',
      });
    },
  });
};

export const useUpdateCuraduria = () => {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCuraduriaData }) =>
      curaduriaApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['curadurias'] });
      queryClient.invalidateQueries({ queryKey: ['curaduria', variables.id] });
      notify({
        type: 'success',
        message: 'Curaduría actualizada exitosamente',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error al actualizar la curaduría';
      notify({
        type: 'error',
        message: errorMessage,
        title: 'Error al actualizar curaduría',
      });
    },
  });
};

export const useDeleteCuraduria = () => {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => curaduriaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curadurias'] });
      notify({
        type: 'success',
        message: 'Curaduría eliminada exitosamente',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error al eliminar la curaduría';
      notify({
        type: 'error',
        message: errorMessage,
        title: 'Error al eliminar curaduría',
      });
    },
  });
};

export const useMatches = (empresaId: string | undefined, minScore: number = 0) => {
  return useQuery({
    queryKey: ['matches', empresaId, minScore],
    queryFn: () => {
      if (!empresaId) {
        throw new Error('EmpresaId es requerido');
      }
      return curaduriaApi.calculateMatches(empresaId, minScore);
    },
    enabled: !!empresaId && empresaId.length > 0,
    retry: false,
  });
};
