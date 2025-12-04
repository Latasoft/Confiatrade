import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { credencialesApi } from '../api/credencialesApi';
import { useNotificationStore } from '@/shared/store/notificationStore';

export const credencialesKeys = {
  all: ['credenciales'] as const,
  stats: () => [...credencialesKeys.all, 'stats'] as const,
  historial: (params?: { skip?: number; limit?: number; tipo?: 'empresa' | 'participante' }) =>
    [...credencialesKeys.all, 'historial', params] as const,
};

// Hook para obtener estadísticas
export function useCredencialesStats() {
  return useQuery({
    queryKey: credencialesKeys.stats(),
    queryFn: () => credencialesApi.getStats(),
  });
}

// Hook para generar credencial de empresa
export function useGenerarCredencialEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (empresaId: string) => 
      credencialesApi.generarCredencialEmpresa(empresaId),
    onSuccess: (blob, empresaId) => {
      // Crear URL temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credencial_empresa_${empresaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Invalidar stats
      queryClient.invalidateQueries({ queryKey: credencialesKeys.stats() });
    },
  });
}

// Hook para generar credenciales en batch
export function useGenerarCredencialesBatch() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.add);

  return useMutation({
    mutationFn: (empresaIds: string[]) => 
      credencialesApi.generarCredencialesBatch(empresaIds),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credenciales_batch.zip`; // ZIP, no PDF
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: credencialesKeys.stats() });
      queryClient.invalidateQueries({ queryKey: credencialesKeys.historial() });
      
      notify({
        type: 'success',
        message: 'Credenciales generadas exitosamente',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Error al generar credenciales';
      notify({
        type: 'error',
        message: errorMessage,
        title: 'Error al generar credenciales',
      });
    },
  });
}

// Hook para generar credencial de participante
export function useGenerarCredencialParticipante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participanteId: string) =>
      credencialesApi.generarCredencialParticipante(participanteId),
    onSuccess: (blob, participanteId) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credencial_participante_${participanteId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: credencialesKeys.stats() });
    },
  });
}

// Hook para obtener historial de credenciales
export function useCredencialesHistorial(params?: {
  skip?: number;
  limit?: number;
  tipo?: 'empresa' | 'participante';
}) {
  return useQuery({
    queryKey: credencialesKeys.historial(params),
    queryFn: () => credencialesApi.getHistorial(params || {}),
  });
}
