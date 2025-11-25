import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qrValidationApi } from '../api/qrValidationApi';

export function useValidarQR() {
  return useMutation({
    mutationFn: (qrJson: string) => qrValidationApi.validarQR(qrJson),
  });
}

export function useCheckInDesdeQR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ qrJson, eventoId }: { qrJson: string; eventoId?: string }) =>
      qrValidationApi.checkInDesdeQR(qrJson, eventoId),
    onSuccess: () => {
      // Invalidar queries de participantes para refrescar el estado de check-in
      queryClient.invalidateQueries({ queryKey: ['participantes'] });
      queryClient.invalidateQueries({ queryKey: ['mis-participantes'] });
    },
  });
}
