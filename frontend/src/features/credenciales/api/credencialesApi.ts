import { apiClient } from '@/shared/api/client';

export interface CredencialStats {
  total_empresas_aprobadas: number;
  total_participantes: number;
  credenciales_generadas: number;
  credenciales_empresas: number;
  credenciales_participantes: number;
  pendientes: number;
  ultima_generacion: string | null;
}

export interface EntidadInfo {
  id: string;
  nombre: string;
  email: string;
  empresa?: string | null;
}

export interface CredencialHistorialItem {
  id: string;
  tipo: 'empresa' | 'participante';
  fecha_generacion: string;
  formato: string;
  pdf_hash: string;
  entidad?: EntidadInfo | null;
}

export interface CredencialHistorialResponse {
  total: number;
  skip: number;
  limit: number;
  items: CredencialHistorialItem[];
}

export const credencialesApi = {
  // Generar credencial para una empresa
  async generarCredencialEmpresa(empresaId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/credenciales/empresa/${empresaId}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Generar credencial para un participante
  async generarCredencialParticipante(participanteId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/credenciales/participante/${participanteId}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Generar credenciales en batch
  async generarCredencialesBatch(empresaIds: string[]): Promise<Blob> {
    const response = await apiClient.post<Blob>(
      '/credenciales/batch/empresas',
      empresaIds,  // FastAPI espera directamente el array en el body
      { 
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // Obtener estadísticas
  async getStats(): Promise<CredencialStats> {
    const response = await apiClient.get<CredencialStats>('/credenciales/stats');
    return response.data;
  },

  // Obtener historial de credenciales
  async getHistorial(params: {
    skip?: number;
    limit?: number;
    tipo?: 'empresa' | 'participante';
  }): Promise<CredencialHistorialResponse> {
    const response = await apiClient.get<CredencialHistorialResponse>('/credenciales/historial', {
      params,
    });
    return response.data;
  },
};
