import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export interface Pais {
  id: number;
  nombre: string;
  codigo: string;
}

export interface Sector {
  id: number;
  nombre: string;
}

const catalogosApi = {
  getPaises: async (): Promise<Pais[]> => {
    const { data } = await apiClient.get('/catalogos/paises');
    return data;
  },

  getSectores: async (): Promise<Sector[]> => {
    const { data } = await apiClient.get('/catalogos/sectores');
    return data;
  },
};

export function usePaises() {
  return useQuery({
    queryKey: ['paises'],
    queryFn: catalogosApi.getPaises,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

export function useSectores() {
  return useQuery({
    queryKey: ['sectores'],
    queryFn: catalogosApi.getSectores,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
