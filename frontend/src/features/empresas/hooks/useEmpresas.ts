import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresasApi } from '../api/empresasApi';
import { EmpresaCreate } from '@/shared/types';

export function useEmpresas(aprobada?: boolean, evento_id?: string) {
  return useQuery({
    queryKey: ['empresas', aprobada, evento_id],
    queryFn: () => empresasApi.getAll(aprobada, evento_id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useEmpresasAprobadas(evento_id?: string) {
  return useQuery({
    queryKey: ['empresas', 'aprobadas', evento_id],
    queryFn: () => empresasApi.getAprobadas(evento_id),
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

export function useUploadPresentacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      empresasApi.uploadPresentacion(id, file),
    onSuccess: (_, variables) => {
      // Invalidar todas las queries de empresas
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['empresas', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['empresas', 'aprobadas'] });
      // Invalidar perfil para actualizar empresa en contexto de usuario
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
    },
  });
}

export function useUpdateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmpresaCreate> }) =>
      empresasApi.updateEmpresa(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['empresas', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
    },
  });
}
