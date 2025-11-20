import { apiClient } from '@/shared/api/client';

// Interfaces
export interface Reunion {
  id: string;
  bloque_id: string;
  empresa_a_id: string;
  empresa_b_id: string;
  sala?: string;
  notas?: string;
  estado: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
  created_at: string;
  updated_at: string;
  // Relaciones
  bloque?: {
    id: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    label: string;
  };
  empresa_a?: {
    id: string;
    nombre: string;
    pais?: string;
  };
  empresa_b?: {
    id: string;
    nombre: string;
    pais?: string;
  };
}

export interface CreateReunionData {
  bloque_id: string;
  empresa_a_id: string;
  empresa_b_id: string;
  sala?: string;
  notas?: string;
  estado?: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
}

export interface UpdateReunionData {
  sala?: string;
  notas?: string;
  estado?: 'programada' | 'confirmada' | 'realizada' | 'cancelada';
}

export interface ReunionListParams {
  empresa_id?: string;
  bloque_id?: string;
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
