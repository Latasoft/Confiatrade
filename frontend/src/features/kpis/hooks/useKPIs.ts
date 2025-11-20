import { useQuery } from '@tanstack/react-query';
import { kpisApi } from '../api/kpisApi';

export const kpisKeys = {
  all: ['kpis'] as const,
  current: () => [...kpisKeys.all, 'current'] as const,
  byEvento: (eventoId: string) => [...kpisKeys.all, 'evento', eventoId] as const,
};

// Hook para obtener KPIs generales
export function useKPIsCurrent() {
  return useQuery({
    queryKey: kpisKeys.current(),
    queryFn: () => kpisApi.getCurrent(),
  });
}

// Hook para obtener KPIs de un evento específico
export function useKPIsByEvento(eventoId: string, enabled = true) {
  return useQuery({
    queryKey: kpisKeys.byEvento(eventoId),
    queryFn: () => kpisApi.getByEvento(eventoId),
    enabled: enabled && !!eventoId,
  });
}
