import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  empresaParticipantesApi,
  type CreateMiParticipanteData,
  type UpdateMiParticipanteData,
} from '../api/empresaParticipantesApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

// Query Keys
export const empresaParticipantesKeys = {
  all: ['empresa', 'participantes'] as const,
  lists: () => [...empresaParticipantesKeys.all, 'list'] as const,
  list: (params?: { skip?: number; limit?: number }) =>
    [...empresaParticipantesKeys.lists(), params] as const,
  details: () => [...empresaParticipantesKeys.all, 'detail'] as const,
  detail: (id: string) => [...empresaParticipantesKeys.details(), id] as const,
};

// Queries
export function useMisParticipantes(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: empresaParticipantesKeys.list(params),
    queryFn: () => empresaParticipantesApi.getMisParticipantes(params),
  });
}

export function useMiParticipante(id: string | undefined) {
  return useQuery({
    queryKey: empresaParticipantesKeys.detail(id!),
    queryFn: () => empresaParticipantesApi.getMiParticipante(id!),
    enabled: !!id,
  });
}

// Mutations
export function useCreateMiParticipante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateMiParticipanteData) =>
      empresaParticipantesApi.createMiParticipante(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresaParticipantesKeys.lists() });
      notify({
        type: 'success',
        message: 'Participante creado exitosamente. QR generado automáticamente.',
      });
    },
    onError: (error: any) => {
      console.error('Error al crear participante:', error);
      // No notificar aquí porque el interceptor ya lo hace
    },
  });
}

export function useUpdateMiParticipante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMiParticipanteData }) =>
      empresaParticipantesApi.updateMiParticipante(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: empresaParticipantesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: empresaParticipantesKeys.detail(variables.id),
      });
      notify({
        type: 'success',
        message: 'Participante actualizado exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error al actualizar participante:', error);
    },
  });
}

export function useDeleteMiParticipante() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => empresaParticipantesApi.deleteMiParticipante(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresaParticipantesKeys.lists() });
      notify({
        type: 'success',
        message: 'Participante eliminado exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error al eliminar participante:', error);
    },
  });
}
