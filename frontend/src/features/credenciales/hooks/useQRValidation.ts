import { useMutation } from '@tanstack/react-query';
import { qrValidationApi } from '../api/qrValidationApi';

export function useValidarQR() {
  return useMutation({
    mutationFn: (qrJson: string) => qrValidationApi.validarQR(qrJson),
  });
}

export function useCheckInDesdeQR() {
  return useMutation({
    mutationFn: ({ qrJson, eventoId }: { qrJson: string; eventoId?: string }) =>
      qrValidationApi.checkInDesdeQR(qrJson, eventoId),
  });
}
