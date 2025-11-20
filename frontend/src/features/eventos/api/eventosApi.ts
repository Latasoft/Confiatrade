import { apiClient } from '@/shared/api/client';

export interface Evento {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
  pais_sede: string;
  capacidad_empresas?: number;
  estado: 'planificacion' | 'inscripcion_abierta' | 'en_curso' | 'finalizado' | 'cancelado';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventoData {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
  pais_sede: string;
  capacidad_empresas?: number;
  estado?: string;
}

export interface UpdateEventoData extends Partial<CreateEventoData> {}

export interface EventoListResponse {
  eventos: Evento[];
  total: number;
  activos: number;
  finalizados: number;
}

export const eventosApi = {
  // Listar eventos
  list: async (params?: {
    skip?: number;
    limit?: number;
    activo?: boolean;
    estado?: string;
    pais_sede?: string;
  }): Promise<EventoListResponse> => {
    const { data } = await apiClient.get<EventoListResponse>('/eventos/', { params });
    return data;
  },

  // Obtener evento por ID
  getById: async (id: string): Promise<Evento> => {
    const { data } = await apiClient.get<Evento>(`/eventos/${id}`);
    return data;
  },

  // Crear evento
  create: async (eventoData: CreateEventoData): Promise<Evento> => {
    const { data } = await apiClient.post<Evento>('/eventos/', eventoData);
    return data;
  },

  // Actualizar evento
  update: async (id: string, eventoData: UpdateEventoData): Promise<Evento> => {
    const { data} = await apiClient.put<Evento>(`/eventos/${id}`, eventoData);
    return data;
  },

  // Eliminar evento (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/eventos/${id}`);
  },
};
