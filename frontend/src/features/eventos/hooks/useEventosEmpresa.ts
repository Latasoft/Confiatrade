import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventosApi, Evento, Inscripcion } from '../api/eventosApi';

/**
 * Hook para obtener eventos disponibles para inscripción
 */
export const useEventosDisponibles = (params?: {
  skip?: number;
  limit?: number;
  pais_sede?: string;
}) => {
  return useQuery<Evento[], Error>({
    queryKey: ['eventos-disponibles', params],
    queryFn: () => eventosApi.getEventosDisponibles(params),
    staleTime: 0,
    refetchOnMount: true,
  });
};

/**
 * Hook para inscribirse a un evento
 */
export const useInscribirseEvento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventoId: string) => eventosApi.inscribirseEvento(eventoId),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['eventos-disponibles'] });
      queryClient.invalidateQueries({ queryKey: ['mis-inscripciones'] });
    },
  });
};

/**
 * Hook para obtener las inscripciones de la empresa actual
 */
export const useMisInscripciones = () => {
  return useQuery<Inscripcion[], Error>({
    queryKey: ['mis-inscripciones'],
    queryFn: () => eventosApi.getMisInscripciones(),
    staleTime: 0,
    refetchOnMount: true,
  });
};
