import { apiClient } from '@/shared/api/client';

export interface Curaduria {
  id: string;
  empresa_id: string;
  ofrece?: string;
  busca?: string;
  objetivos?: string;
  capacidades?: string;
  notas_internas?: string;
  created_at: string;
  updated_at: string;
  empresa_nombre?: string;
  empresa_sector?: string;
  empresa_pais?: string;
}

export interface CreateCuraduriaData {
  empresa_id: string;
  ofrece?: string;
  busca?: string;
  objetivos?: string;
  capacidades?: string;
  notas_internas?: string;
}

export interface UpdateCuraduriaData extends Partial<Omit<CreateCuraduriaData, 'empresa_id'>> {}

export interface MatchScore {
  empresa_a_id: string;
  empresa_a_nombre: string;
  empresa_b_id: string;
  empresa_b_nombre: string;
  score: number;
  sector_match: boolean;
  keywords_ofrece_busca: string[];
  keywords_busca_ofrece: string[];
  detalles: Record<string, any>;
}

export interface MatchListResponse {
  matches: MatchScore[];
  total: number;
}

export interface CuraduriaListResponse {
  curaduria: Curaduria[];
  total: number;
}

export const curaduriaApi = {
  // Listar curadurías
  list: async (params?: { skip?: number; limit?: number }): Promise<CuraduriaListResponse> => {
    const { data } = await apiClient.get<CuraduriaListResponse>('/curaduria/', { params });
    return data;
  },

  // Obtener curaduría por ID
  getById: async (id: string): Promise<Curaduria> => {
    const { data } = await apiClient.get<Curaduria>(`/curaduria/${id}`);
    return data;
  },

  // Obtener curaduría por empresa
  getByEmpresa: async (empresaId: string): Promise<Curaduria | null> => {
    try {
      const response = await curaduriaApi.list();
      const curaduria = response.curaduria.find((c) => c.empresa_id === empresaId);
      return curaduria || null;
    } catch {
      return null;
    }
  },

  // Crear curaduría
  create: async (data: CreateCuraduriaData): Promise<Curaduria> => {
    const { data: response } = await apiClient.post<Curaduria>('/curaduria/', data);
    return response;
  },

  // Actualizar curaduría
  update: async (id: string, data: UpdateCuraduriaData): Promise<Curaduria> => {
    const { data: response } = await apiClient.put<Curaduria>(`/curaduria/${id}`, data);
    return response;
  },

  // Eliminar curaduría
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/curaduria/${id}`);
  },

  // Calcular matches para empresa
  calculateMatches: async (
    empresaId: string,
    minScore: number = 0
  ): Promise<MatchListResponse> => {
    const { data } = await apiClient.get<MatchListResponse>(
      `/curaduria/matches/${empresaId}`,
      { params: { min_score: minScore } }
    );
    return data;
  },
};
