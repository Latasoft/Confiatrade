import { apiClient } from '@/shared/api/client';

export interface QRValidacionResponse {
  valido: boolean;
  razon?: string;
  tipo?: 'empresa' | 'participante';
  entity_id?: string;
  evento_id?: string;
  timestamp?: string;
  nombre?: string;
  email?: string;
  empresa_nombre?: string;
  aprobada?: boolean;
  telefono?: string;
  pais_nombre?: string;
  sector_nombre?: string;
}

export interface QRCheckInResponse {
  success: boolean;
  message: string;
  participante_id?: string;
  participante_nombre?: string;
  empresa_nombre?: string;
  ya_registrado?: boolean;
  fecha_check_in?: string;
}

export const qrValidationApi = {
  // Validar QR escaneado
  async validarQR(qrJson: string): Promise<QRValidacionResponse> {
    const response = await apiClient.post<QRValidacionResponse>(
      '/credenciales/validar',
      { qr_json: qrJson }
    );
    return response.data;
  },

  // Registrar check-in desde QR
  async checkInDesdeQR(qrJson: string, eventoId?: string): Promise<QRCheckInResponse> {
    const response = await apiClient.post<QRCheckInResponse>(
      '/credenciales/check-in',
      { 
        qr_json: qrJson,
        evento_id: eventoId 
      }
    );
    return response.data;
  },
};
