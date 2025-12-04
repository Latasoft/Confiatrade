import { apiClient } from '@/shared/api/client';

// Interfaces
export interface ReunionBase {
  id: string;
  bloque_id: number;
  empresa_a_id: string;
  empresa_b_id: string;
  sala?: string;
  notas?: string;
  requiere_interprete?: boolean;
  resultado?: string;
  estado: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
  created_at: string;
  updated_at: string;
}

export interface ReunionDetallada extends ReunionBase {
  // Campos planos calculados del backend (GET /reuniones/, GET /reuniones/{id})
  empresa_a_nombre?: string;
  empresa_b_nombre?: string;
  bloque_fecha?: string;
  bloque_hora_inicio?: string;
  bloque_hora_fin?: string;
  bloque_ubicacion?: string;
  evento_id?: string;
  evento_nombre?: string;
}

// Alias para compatibilidad con código existente
export type Reunion = ReunionDetallada;

export interface CreateReunionData {
  bloque_id: number;
  empresa_a_id: string;
  empresa_b_id: string;
  sala?: string;
  notas?: string;
  requiere_interprete?: boolean;
  estado?: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
}

export interface UpdateReunionData {
  bloque_id?: number;
  sala?: string;
  notas?: string;
  requiere_interprete?: boolean;
  resultado?: string;
  estado?: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
}

export interface ReunionListParams {
  empresa_id?: string;
  bloque_id?: number;
  sala?: string;
  estado?: string;
  fecha?: string;
  skip?: number;
  limit?: number;
}

export interface ReunionListResponse {
  reuniones: Reunion[];
  total: number;
}

export const reunionesApi = {
  // Listar reuniones
  list: async (params?: ReunionListParams): Promise<ReunionListResponse> => {
    const response = await apiClient.get('/reuniones/', { params });
    return response.data;
  },

  // Obtener por ID
  getById: async (id: string): Promise<Reunion> => {
    const response = await apiClient.get(`/reuniones/${id}`);
    return response.data;
  },

  // Crear reunión
  create: async (data: CreateReunionData): Promise<Reunion> => {
    const response = await apiClient.post('/reuniones/', data);
    return response.data;
  },

  // Actualizar reunión
  update: async (id: string, data: UpdateReunionData): Promise<Reunion> => {
    const response = await apiClient.put(`/reuniones/${id}`, data);
    return response.data;
  },

  // Eliminar reunión
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reuniones/${id}`);
  },
};
