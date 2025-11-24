import { apiClient } from '@/shared/api/client';

// Interfaces
export interface BloqueHorario {
  id: number;  // Backend usa int, no UUID
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  evento_id?: string;
  ubicacion?: string;
  label?: string;
  disponible: boolean;
  activo: boolean;
  created_at: string;
  // Campos adicionales de DetailResponse
  evento_nombre?: string;
}

export interface CreateBloqueData {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  evento_id?: string;
  label: string;
  activo?: boolean;
}

export interface UpdateBloqueData {
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  evento_id?: string;
  label?: string;
  activo?: boolean;
}

export interface BloqueListParams {
  evento_id?: string;
  fecha?: string;
  activo?: boolean;
  skip?: number;
  limit?: number;
}

export interface BloqueListResponse {
  bloques: BloqueHorario[];
  total: number;
}

export interface GenerateBloqueRequest {
  evento_id?: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  label_prefijo?: string;
}

export interface GenerateBloqueResponse {
  bloques_creados: BloqueHorario[];
  total_creados: number;
  message: string;
}

export const bloquesHorariosApi = {
  // Listar bloques horarios
  list: async (params?: BloqueListParams): Promise<BloqueListResponse> => {
    const response = await apiClient.get('/bloques-horarios/', { params });
    return response.data;
  },

  // Obtener por ID
  getById: async (id: number): Promise<BloqueHorario> => {
    const response = await apiClient.get(`/bloques-horarios/${id}`);
    return response.data;
  },

  // Crear bloque
  create: async (data: CreateBloqueData): Promise<BloqueHorario> => {
    const response = await apiClient.post('/bloques-horarios/', data);
    return response.data;
  },

  // Actualizar bloque
  update: async (id: number, data: UpdateBloqueData): Promise<BloqueHorario> => {
    const response = await apiClient.put(`/bloques-horarios/${id}`, data);
    return response.data;
  },

  // Eliminar bloque
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/bloques-horarios/${id}`);
  },

  // Generar bloques automáticamente
  generateAuto: async (data: GenerateBloqueRequest): Promise<GenerateBloqueResponse> => {
    const response = await apiClient.post('/bloques-horarios/generar', data);
    return response.data;
  },
};
