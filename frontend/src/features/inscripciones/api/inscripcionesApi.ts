import { apiClient } from '@/shared/api/client';

export interface EmpresaEvento {
  id: string;
  empresa_id: string;
  evento_id: string;
  aprobada: boolean | null;  // null=Pendiente, true=Aprobada, false=Rechazada
  fecha_inscripcion: string;
  created_at: string;
  updated_at: string;
  empresa_nombre?: string;
  evento_nombre?: string;
}

export interface EmpresaEventoListResponse {
  inscripciones: EmpresaEvento[];
  total: number;
  aprobadas: number;
  pendientes: number;
}

export const inscripcionesApi = {
  // Listar inscripciones de un evento
  listarPorEvento: async (
    eventoId: string,
    aprobada?: boolean
  ): Promise<EmpresaEventoListResponse> => {
    const params = aprobada !== undefined ? { aprobada } : {};
    const { data } = await apiClient.get<EmpresaEventoListResponse>(
      `/empresas-eventos/evento/${eventoId}`,
      { params }
    );
    return data;
  },

  // Listar todas las inscripciones
  listarTodas: async (aprobada?: boolean): Promise<EmpresaEventoListResponse> => {
    const params = aprobada !== undefined ? { aprobada } : {};
    const { data } = await apiClient.get<EmpresaEventoListResponse>(
      '/empresas-eventos/',
      { params }
    );
    return data;
  },

  // Aprobar inscripción
  aprobar: async (inscripcionId: string): Promise<EmpresaEvento> => {
    const { data } = await apiClient.put<EmpresaEvento>(
      `/empresas-eventos/${inscripcionId}`,
      { aprobada: true }
    );
    return data;
  },

  // Rechazar inscripción
  rechazar: async (inscripcionId: string): Promise<EmpresaEvento> => {
    const { data } = await apiClient.put<EmpresaEvento>(
      `/empresas-eventos/${inscripcionId}`,
      { aprobada: false }
    );
    return data;
  },

  // Cancelar inscripción (eliminar)
  cancelar: async (inscripcionId: string): Promise<void> => {
    await apiClient.delete(`/empresas-eventos/${inscripcionId}`);
  },
};
