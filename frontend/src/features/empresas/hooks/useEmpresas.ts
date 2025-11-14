import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresasApi } from '../api/empresasApi';
import { EmpresaCreate } from '@/shared/types';

export function useEmpresas() {
  return useQuery({
    queryKey: ['empresas'],
    queryFn: empresasApi.getAll,
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
