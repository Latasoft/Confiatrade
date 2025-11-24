import { apiClient } from '@/shared/api/client';
import { Empresa, EmpresaCreate } from '@/shared/types';

export const empresasApi = {
  getAll: async (aprobada?: boolean): Promise<Empresa[]> => {
    const params = aprobada !== undefined ? { aprobada } : {};
    const { data } = await apiClient.get('/empresas', { params });
    return data;
  },

  getAprobadas: async (): Promise<Empresa[]> => {
    const { data } = await apiClient.get('/empresas', { params: { aprobada: true } });
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

  aprobar: async (id: string): Promise<Empresa> => {
    const { data } = await apiClient.patch(`/empresas/${id}/aprobar`);
    return data;
  },

  rechazar: async (id: string): Promise<Empresa> => {
    const { data } = await apiClient.patch(`/empresas/${id}/rechazar`);
    return data;
  },

  uploadPresentacion: async (id: string, file: File): Promise<Empresa> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/empresas/${id}/presentacion`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  updateEmpresa: async (id: string, empresaData: Partial<Empresa>): Promise<Empresa> => {
    const { data } = await apiClient.put(`/empresas/${id}`, empresaData);
    return data;
  },

  getEmpresaDetails: async (id: string): Promise<Empresa> => {
    const { data } = await apiClient.get(`/empresas/${id}`);
    return data;
  },
};
