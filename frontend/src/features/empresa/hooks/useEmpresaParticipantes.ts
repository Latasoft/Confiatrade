import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  empresaParticipantesApi,
  type CreateMiParticipanteData,
  type UpdateMiParticipanteData,
} from '../api/empresaParticipantesApi';

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

  return useMutation({
    mutationFn: (data: CreateMiParticipanteData) =>
      empresaParticipantesApi.createMiParticipante(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresaParticipantesKeys.lists() });
    },
  });
}

export function useUpdateMiParticipante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMiParticipanteData }) =>
      empresaParticipantesApi.updateMiParticipante(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: empresaParticipantesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: empresaParticipantesKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteMiParticipante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresaParticipantesApi.deleteMiParticipante(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresaParticipantesKeys.lists() });
    },
  });
}
