import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  participantesApi,
  type ParticipanteListParams,
  type CreateParticipanteData,
  type UpdateParticipanteData,
} from '../api/participantesApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

// Query Keys
export const participanteKeys = {
  all: ['participantes'] as const,
  lists: () => [...participanteKeys.all, 'list'] as const,
  list: (params?: ParticipanteListParams) => [...participanteKeys.lists(), params] as const,
  details: () => [...participanteKeys.all, 'detail'] as const,
  detail: (id: string) => [...participanteKeys.details(), id] as const,
};

// Queries
export function useParticipantes(params?: ParticipanteListParams) {
  return useQuery({
    queryKey: participanteKeys.list(params),
    queryFn: () => participantesApi.list(params),
  });
}

export function useParticipante(id: string | undefined) {
  return useQuery({
    queryKey: participanteKeys.detail(id!),
    queryFn: () => participantesApi.getById(id!),
    enabled: !!id,
  });
}

// Mutations
export function useCreateParticipante() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (data: CreateParticipanteData) => participantesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participanteKeys.lists() });
      addNotification({
        type: 'success',
        message: 'Participante creado exitosamente (QR generado automáticamente)',
      });
    },
  });
}

export function useUpdateParticipante() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParticipanteData }) =>
      participantesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: participanteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: participanteKeys.detail(variables.id) });
      addNotification({
        type: 'success',
        message: 'Participante actualizado exitosamente',
      });
    },
  });
}

export function useDeleteParticipante() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (id: string) => participantesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participanteKeys.lists() });
      addNotification({
        type: 'success',
        message: 'Participante eliminado exitosamente',
      });
    },
  });
}

export function useCheckInParticipante() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: ({ id, qrData, force }: { id: string; qrData?: string; force?: boolean }) =>
      participantesApi.checkIn(id, qrData, force),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: participanteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: participanteKeys.detail(variables.id) });
      addNotification({
        type: 'success',
        message: 'Check-in realizado exitosamente',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Error al realizar check-in';
      addNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
}
