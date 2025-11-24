import { apiClient } from '@/shared/api/client';

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string | null;
  rol: 'admin' | 'empresa';
  empresa_id: string | null;
  activo: boolean;
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegistroEmpresaData {
  email: string;
  password: string;
  nombre_completo: string;
  nombre_empresa: string;
  pais_id: number;
  sector_id: number;
  descripcion?: string;
  sitio_web?: string;
  telefono?: string;
  direccion?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: Usuario;
}

export interface PerfilUsuario {
  id: string;
  email: string;
  nombre_completo: string | null;
  rol: string;
  activo: boolean;
  created_at: string;
  empresa: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    sitio_web: string | null;
    aprobada: boolean;
    pais_id: number;
    sector_id: number;
    presentacion_url?: string | null;
    descripcion?: string | null;
    direccion?: string | null;
    pais_nombre?: string;
    sector_nombre?: string;
  } | null;
}

export interface CambiarPasswordData {
  password_actual: string;
  password_nuevo: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  registroEmpresa: async (data: RegistroEmpresaData): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/registro-empresa', data);
    return response.data;
  },

  getPerfil: async (): Promise<PerfilUsuario> => {
    const response = await apiClient.get<PerfilUsuario>('/auth/perfil');
    return response.data;
  },

  cambiarPassword: async (data: CambiarPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/cambiar-password', data);
    return response.data;
  },

  verificarToken: async (): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>('/auth/verificar-token');
    return response.data;
  },
};
