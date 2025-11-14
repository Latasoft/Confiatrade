import { apiClient } from '@/shared/api/client';
import { Empresa, EmpresaCreate } from '@/shared/types';

export const empresasApi = {
  getAll: async (): Promise<Empresa[]> => {
    const { data } = await apiClient.get('/empresas');
    return data;
  },

  getById: async (id: string): Promise<Empresa> => {
    const { data } = await apiClient.get(`/empresas/${id}`);
    return data;
  },

  create: async (empresa: EmpresaCreate): Promise<Empresa> => {
    const { data } = await apiClient.post('/empresas', empresa);
    return data;
  },

  update: async (id: string, empresa: Partial<EmpresaCreate>): Promise<Empresa> => {
    const { data } = await apiClient.put(`/empresas/${id}`, empresa);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/empresas/${id}`);
  },
};
