import { apiClient } from '@/shared/api/client';

export type TipoSeguimiento = 'acuerdo' | 'loi' | 'seguimiento';
export type EstadoSeguimiento = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';

export interface Seguimiento {
  id: string;
  empresa_id: string;
  tipo: TipoSeguimiento;
  descripcion: string;
  estado: EstadoSeguimiento;
  responsable?: string;
  fecha_compromiso?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  empresa_nombre?: string;
  empresa_pais?: string;
  empresa_sector?: string;
}

export interface CreateSeguimientoData {
  empresa_id: string;
  tipo: TipoSeguimiento;
  descripcion: string;
  estado?: EstadoSeguimiento;
  responsable?: string;
  fecha_compromiso?: string;
  notas?: string;
}

export interface UpdateSeguimientoData {
  tipo?: TipoSeguimiento;
  descripcion?: string;
  estado?: EstadoSeguimiento;
  responsable?: string;
  fecha_compromiso?: string;
  notas?: string;
}

export interface SeguimientoListParams {
  tipo?: TipoSeguimiento;
  estado?: EstadoSeguimiento;
  empresa_id?: string;
}

export interface SeguimientoListResponse {
  seguimientos: Seguimiento[];
  total: number;
}

export const seguimientoApi = {
  async list(params?: SeguimientoListParams): Promise<SeguimientoListResponse> {
    const response = await apiClient.get<SeguimientoListResponse>(
      '/seguimiento/',
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<Seguimiento> {
    const response = await apiClient.get<Seguimiento>(`/seguimiento/${id}`);
    return response.data;
  },

  async create(data: CreateSeguimientoData): Promise<Seguimiento> {
    const response = await apiClient.post<Seguimiento>('/seguimiento/', data);
    return response.data;
  },

  async update(id: string, data: UpdateSeguimientoData): Promise<Seguimiento> {
    const response = await apiClient.patch<Seguimiento>(
      `/seguimiento/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/seguimiento/${id}`);
  },
};
