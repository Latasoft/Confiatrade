import { apiClient } from '@/shared/api/client';

// Interfaces
export interface Participante {
  id: string;
  empresa_id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  cargo?: string;
  foto_url?: string;
  qr_data?: string;
  idioma: 'ES' | 'EN' | 'PT' | 'FR';
  requiere_interprete: boolean;
  check_in_realizado: boolean;
  fecha_check_in?: string;
  created_at: string;
  updated_at: string;
  // Campo plano calculado del backend (ParticipanteDetailResponse)
  empresa_nombre?: string;
}

export interface CreateParticipanteData {
  empresa_id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  cargo?: string;
  foto_url?: string;
  idioma?: 'ES' | 'EN' | 'PT' | 'FR';
  requiere_interprete?: boolean;
}

export interface UpdateParticipanteData {
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  foto_url?: string;
  idioma?: 'ES' | 'EN' | 'PT' | 'FR';
  requiere_interprete?: boolean;
}

export interface ParticipanteListParams {
  empresa_id?: string;
  idioma?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface ParticipanteListResponse {
  participantes: Participante[];
  total: number;
}

export const participantesApi = {
  // Listar participantes
  list: async (params?: ParticipanteListParams): Promise<ParticipanteListResponse> => {
    const response = await apiClient.get('/participantes/', { params });
    return response.data;
  },

  // Obtener por ID
  getById: async (id: string): Promise<Participante> => {
    const response = await apiClient.get(`/participantes/${id}`);
    return response.data;
  },

  // Crear participante (QR se genera automáticamente en backend)
  create: async (data: CreateParticipanteData): Promise<Participante> => {
    const response = await apiClient.post('/participantes/', data);
    return response.data;
  },

  // Actualizar participante
  update: async (id: string, data: UpdateParticipanteData): Promise<Participante> => {
    const response = await apiClient.put(`/participantes/${id}`, data);
    return response.data;
  },

  // Eliminar participante
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/participantes/${id}`);
  },

  // Realizar check-in
  checkIn: async (id: string, qrData?: string, force?: boolean): Promise<Participante> => {
    const response = await apiClient.post(`/participantes/${id}/check-in`, {
      qr_data: qrData,
      force: force || false,
    });
    return response.data;
  },
};
