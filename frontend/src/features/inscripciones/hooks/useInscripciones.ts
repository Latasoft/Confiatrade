import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inscripcionesApi } from '../api/inscripcionesApi';

/**
 * Hook para obtener inscripciones de un evento específico
 */
export const useInscripcionesPorEvento = (eventoId: string, aprobada?: boolean) => {
  return useQuery({
    queryKey: ['inscripciones-evento', eventoId, aprobada],
    queryFn: () => inscripcionesApi.listarPorEvento(eventoId, aprobada),
    enabled: !!eventoId,
  });
};

/**
 * Hook para obtener todas las inscripciones
 */
export const useInscripciones = (aprobada?: boolean) => {
  return useQuery({
    queryKey: ['inscripciones', aprobada],
    queryFn: () => inscripcionesApi.listarTodas(aprobada),
  });
};

/**
 * Hook para aprobar una inscripción
 */
export const useAprobarInscripcion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inscripcionId: string) => inscripcionesApi.aprobar(inscripcionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
      queryClient.invalidateQueries({ queryKey: ['inscripciones-evento'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};

/**
 * Hook para rechazar una inscripción
 */
export const useRechazarInscripcion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inscripcionId: string) => inscripcionesApi.rechazar(inscripcionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
      queryClient.invalidateQueries({ queryKey: ['inscripciones-evento'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};

/**
 * Hook para cancelar una inscripción (eliminar)
 */
export const useCancelarInscripcion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inscripcionId: string) => inscripcionesApi.cancelar(inscripcionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
      queryClient.invalidateQueries({ queryKey: ['inscripciones-evento'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};
