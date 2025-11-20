import { apiClient } from '@/shared/api/client';

export interface KPIData {
  // Métricas de Empresas
  total_empresas: number;
  meta_empresas: number;
  empresas_inscritas: number;
  empresas_aprobadas: number;
  empresas_pendientes: number;
  tasa_inscripcion: number;
  tasa_aprobacion: number;

  // Métricas de Eventos
  total_eventos: number;
  eventos_activos: number;

  // Métricas de Reuniones
  total_reuniones: number;
  reuniones_programadas: number;
  reuniones_confirmadas: number;
  reuniones_realizadas: number;
  reuniones_canceladas: number;
  tasa_realizacion: number;

  // Métricas de Ocupación
  total_bloques: number;
  bloques_ocupados: number;
  bloques_disponibles: number;
  tasa_ocupacion: number;

  // Métricas de Acuerdos
  total_seguimientos: number;
  acuerdos_cerrados: number;
  lois_firmadas: number;
  monto_total_estimado: number;

  // Métricas de Participantes
  total_participantes: number;
  participantes_checkin: number;
  tasa_checkin: number;
}

export interface KPIResponse {
  kpis: KPIData;
  evento_id?: string;
  evento_nombre?: string;
  fecha_consulta: string;
}

export const kpisApi = {
  // Obtener KPIs generales (todos los eventos)
  async getCurrent(): Promise<{ kpis: KPIData }> {
    const response = await apiClient.get<{ kpis: KPIData }>('/kpis/current');
    return response.data;
  },

  // Obtener KPIs de un evento específico
  async getByEvento(eventoId: string): Promise<KPIResponse> {
    const response = await apiClient.get<KPIResponse>(`/kpis/evento/${eventoId}`);
    return response.data;
  },
};
