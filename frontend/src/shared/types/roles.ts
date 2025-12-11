// Types para el sistema de roles y permisos

export interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  modulo: string;
  accion: string;
  recurso: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_sistema: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
  permisos: Permiso[];
}

export interface RolSimple {
  id: string;
  nombre: string;
  descripcion?: string | null;
  es_sistema: boolean;
  activo: boolean;
  permisos?: Permiso[];
}

export interface UsuarioOrganizador {
  id: string;
  email: string;
  nombre_completo: string | null;
  rol_antiguo: string | null;
  rol: RolSimple | null;
  activo: boolean;
  created_at: string;
}

export interface CrearRolRequest {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  permisos_ids: string[];
}

export interface ActualizarRolRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos_ids?: string[];
}

export interface CrearOrganizadorRequest {
  email: string;
  password: string;
  nombre_completo: string;
  rol_id: string;
}

export interface AsignarRolRequest {
  rol_id: string;
}

export interface PermisosUsuario {
  usuario_id: string;
  email: string;
  rol: RolSimple | null;
  permisos: Permiso[];
}

export interface PermisosPorModulo {
  modulo: string;
  permisos: Permiso[];
}

export interface RolesListResponse {
  total: number;
  roles: Rol[];
}

export interface PermisosListResponse {
  total: number;
  permisos: Permiso[];
}

export interface AsignarPermisosRequest {
  permisos_ids: string[];
}

export interface VerificarPermisoRequest {
  permiso_nombre: string;
}

export interface VerificarPermisoResponse {
  tiene_permiso: boolean;
  usuario_id: string;
  permiso_nombre: string;
}
