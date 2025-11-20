import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresasApi } from '../api/empresasApi';
import { EmpresaCreate } from '@/shared/types';

export function useEmpresas(aprobada?: boolean) {
  return useQuery({
    queryKey: ['empresas', aprobada],
    queryFn: () => empresasApi.getAll(aprobada),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useEmpresasAprobadas() {
  return useQuery({
    queryKey: ['empresas', 'aprobadas'],
    queryFn: empresasApi.getAprobadas,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useEmpresa(id: string) {
  return useQuery({
    queryKey: ['empresas', id],
    queryFn: () => empresasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (empresa: EmpresaCreate) => empresasApi.create(empresa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    },
  });
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    },
  });
}

export function useAprobarEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresasApi.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    },
  });
}

export function useRechazarEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresasApi.rechazar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
    },
  });
}
