import { apiClient } from '@/shared/api/client';
import {
  Rol,
  Permiso,
  PermisosPorModulo,
  CrearRolRequest,
  ActualizarRolRequest,
  CrearOrganizadorRequest,
  UsuarioOrganizador,
  PermisosUsuario,
  RolesListResponse,
  PermisosListResponse,
  AsignarPermisosRequest,
  AsignarRolRequest,
} from '@/shared/types/roles';

// ============================================
// ROLES
// ============================================

export const getRoles = async (activo?: boolean): Promise<RolesListResponse> => {
  const params = activo !== undefined ? { activo } : {};
  const response = await apiClient.get<RolesListResponse>('/roles', { params });
  return response.data;
};

export const getRol = async (rolId: string): Promise<Rol> => {
  const response = await apiClient.get<Rol>(`/roles/${rolId}`);
  return response.data;
};

export const crearRol = async (data: CrearRolRequest): Promise<Rol> => {
  const response = await apiClient.post<Rol>('/roles', data);
  return response.data;
};

export const actualizarRol = async (
  rolId: string,
  data: ActualizarRolRequest
): Promise<Rol> => {
  const response = await apiClient.put<Rol>(`/roles/${rolId}`, data);
  return response.data;
};

export const verificarPuedeEliminarRol = async (rolId: string): Promise<{
  puede_eliminar: boolean;
  motivo: string | null;
  usuarios_asignados: number;
}> => {
  const response = await apiClient.get(`/roles/${rolId}/puede-eliminar`);
  return response.data;
};

export const eliminarRol = async (rolId: string): Promise<void> => {
  await apiClient.delete(`/roles/${rolId}`);
};

export const asignarPermisosARol = async (
  rolId: string,
  permisosIds: string[]
): Promise<Rol> => {
  const response = await apiClient.post<Rol>(
    `/roles/${rolId}/permisos`,
    { permisos_ids: permisosIds } as AsignarPermisosRequest
  );
  return response.data;
};

export const removerPermisosDeRol = async (
  rolId: string,
  permisosIds: string[]
): Promise<Rol> => {
  const response = await apiClient.delete<Rol>(`/roles/${rolId}/permisos`, {
    data: { permisos_ids: permisosIds } as AsignarPermisosRequest,
  });
  return response.data;
};

// ============================================
// PERMISOS
// ============================================

export const getPermisos = async (
  modulo?: string,
  activo?: boolean
): Promise<PermisosListResponse> => {
  const params: any = {};
  if (modulo) params.modulo = modulo;
  if (activo !== undefined) params.activo = activo;

  const response = await apiClient.get<PermisosListResponse>('/roles/permisos', { params });
  return response.data;
};

export const getPermisosPorModulo = async (): Promise<PermisosPorModulo[]> => {
  const response = await apiClient.get<PermisosPorModulo[]>('/roles/permisos/por-modulo');
  return response.data;
};

export const getPermiso = async (permisoId: string): Promise<Permiso> => {
  const response = await apiClient.get<Permiso>(`/permisos/${permisoId}`);
  return response.data;
};

// ============================================
// ORGANIZADORES
// ============================================

export const getOrganizadores = async (
  activo?: boolean
): Promise<UsuarioOrganizador[]> => {
  const params = activo !== undefined ? { activo } : {};
  const response = await apiClient.get<UsuarioOrganizador[]>(
    '/organizadores',
    { params }
  );
  return response.data;
};

export const crearOrganizador = async (
  data: CrearOrganizadorRequest
): Promise<UsuarioOrganizador> => {
  const response = await apiClient.post<UsuarioOrganizador>(
    '/organizadores',
    data
  );
  return response.data;
};

export const asignarRolAUsuario = async (
  usuarioId: string,
  rolId: string
): Promise<UsuarioOrganizador> => {
  const response = await apiClient.put<UsuarioOrganizador>(
    `/organizadores/${usuarioId}/rol`,
    { rol_id: rolId } as AsignarRolRequest
  );
  return response.data;
};

export const eliminarOrganizador = async (usuarioId: string): Promise<void> => {
  await apiClient.delete(`/organizadores/${usuarioId}`);
};

export const activarDesactivarUsuario = async (
  usuarioId: string,
  activo: boolean
): Promise<UsuarioOrganizador> => {
  const response = await apiClient.put<UsuarioOrganizador>(
    `/organizadores/${usuarioId}/activar`,
    null,
    { params: { activo } }
  );
  return response.data;
};

export const getMisPermisos = async (): Promise<PermisosUsuario> => {
  const response = await apiClient.get<PermisosUsuario>(
    '/organizadores/mi-perfil/permisos'
  );
  return response.data;
};

export const getPermisosUsuario = async (
  usuarioId: string
): Promise<PermisosUsuario> => {
  const response = await apiClient.get<PermisosUsuario>(
    `/organizadores/${usuarioId}/permisos`
  );
  return response.data;
};
