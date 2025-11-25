import { apiClient } from '@/shared/api/client';

export interface MiParticipante {
  id: string;
  empresa_id: string;
  nombre_completo: string;
  cargo?: string;
  email: string;
  telefono?: string;
  idioma: string;
  requiere_interprete: boolean;
  foto_url?: string;
  qr_data?: string;
  check_in_realizado: boolean;
  fecha_check_in?: string;
  created_at: string;
  updated_at: string;
  empresa_nombre?: string;
}

export interface MiParticipanteListResponse {
  total: number;
  skip: number;
  limit: number;
  items: MiParticipante[];
}

export interface CreateMiParticipanteData {
  nombre_completo: string;
  cargo?: string;
  email: string;
  telefono?: string;
  idioma?: string;
  requiere_interprete?: boolean;
  foto_url?: string;
}

export interface UpdateMiParticipanteData {
  nombre_completo?: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  idioma?: string;
  requiere_interprete?: boolean;
  foto_url?: string;
}

export const empresaParticipantesApi = {
  // Listar mis participantes
  async getMisParticipantes(params?: { skip?: number; limit?: number }): Promise<MiParticipanteListResponse> {
    const response = await apiClient.get<MiParticipanteListResponse>('/empresa/participantes', {
      params,
    });
    return response.data;
  },

  // Obtener un participante por ID
  async getMiParticipante(id: string): Promise<MiParticipante> {
    const response = await apiClient.get<MiParticipante>(`/empresa/participantes/${id}`);
    return response.data;
  },

  // Crear participante
  async createMiParticipante(data: CreateMiParticipanteData): Promise<MiParticipante> {
    const response = await apiClient.post<MiParticipante>('/empresa/participantes', data);
    return response.data;
  },

  // Actualizar participante
  async updateMiParticipante(id: string, data: UpdateMiParticipanteData): Promise<MiParticipante> {
    const response = await apiClient.put<MiParticipante>(`/empresa/participantes/${id}`, data);
    return response.data;
  },

  // Eliminar participante
  async deleteMiParticipante(id: string): Promise<void> {
    await apiClient.delete(`/empresa/participantes/${id}`);
  },
};
