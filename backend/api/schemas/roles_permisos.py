"""
Schemas Pydantic para el sistema de roles y permisos
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

# ============================================
# SCHEMAS PARA PERMISOS
# ============================================


class PermisoBase(BaseModel):
    """Schema base para permisos"""

    nombre: str = Field(
        ..., min_length=3, max_length=100, description="Nombre único del permiso"
    )
    descripcion: Optional[str] = Field(None, description="Descripción del permiso")
    modulo: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Módulo al que pertenece (ej: empresas, eventos)",
    )
    accion: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Acción que permite (ej: ver, crear, editar)",
    )
    recurso: Optional[str] = Field(
        None, max_length=100, description="Recurso específico (opcional)"
    )


class PermisoCreate(PermisoBase):
    """Schema para crear un permiso"""

    activo: bool = Field(default=True, description="Si el permiso está activo")


class PermisoUpdate(BaseModel):
    """Schema para actualizar un permiso"""

    descripcion: Optional[str] = None
    activo: Optional[bool] = None


class PermisoResponse(PermisoBase):
    """Schema de respuesta para un permiso"""

    id: UUID
    activo: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# SCHEMAS PARA ROLES
# ============================================


class RolBase(BaseModel):
    """Schema base para roles"""

    nombre: str = Field(
        ..., min_length=3, max_length=100, description="Nombre único del rol"
    )
    descripcion: Optional[str] = Field(None, description="Descripción del rol")


class RolCreate(RolBase):
    """Schema para crear un rol"""

    activo: bool = Field(default=True, description="Si el rol está activo")
    permisos_ids: List[UUID] = Field(
        default=[], description="Lista de IDs de permisos a asignar"
    )


class RolUpdate(BaseModel):
    """Schema para actualizar un rol"""

    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    descripcion: Optional[str] = None
    activo: Optional[bool] = None
    permisos_ids: Optional[List[UUID]] = Field(
        None, description="Lista de IDs de permisos a asignar"
    )


class RolResponse(RolBase):
    """Schema de respuesta para un rol"""

    id: UUID
    es_sistema: bool
    activo: bool
    created_at: datetime
    updated_at: datetime
    permisos: List[PermisoResponse] = []

    class Config:
        from_attributes = True


class RolSimpleResponse(RolBase):
    """Schema de respuesta simple para un rol (sin permisos)"""

    id: UUID
    es_sistema: bool
    activo: bool

    class Config:
        from_attributes = True


# ============================================
# SCHEMAS PARA ASIGNACIÓN DE PERMISOS
# ============================================


class AsignarPermisosRequest(BaseModel):
    """Schema para asignar permisos a un rol"""

    permisos_ids: List[UUID] = Field(
        ..., description="Lista de IDs de permisos a asignar"
    )


class RemoverPermisosRequest(BaseModel):
    """Schema para remover permisos de un rol"""

    permisos_ids: List[UUID] = Field(
        ..., description="Lista de IDs de permisos a remover"
    )


# ============================================
# SCHEMAS PARA RESPUESTAS DE LISTADOS
# ============================================


class RolListResponse(BaseModel):
    """Schema de respuesta para listado de roles"""

    total: int
    roles: List[RolResponse]


class PermisoListResponse(BaseModel):
    """Schema de respuesta para listado de permisos"""

    total: int
    permisos: List[PermisoResponse]


class PermisosPorModuloResponse(BaseModel):
    """Schema para agrupar permisos por módulo"""

    modulo: str
    permisos: List[PermisoResponse]


# ============================================
# SCHEMAS PARA USUARIOS CON ROLES
# ============================================


class UsuarioRolResponse(BaseModel):
    """Schema de respuesta que incluye rol del usuario"""

    id: UUID
    email: str
    nombre_completo: Optional[str]
    rol_antiguo: Optional[str]  # Campo antiguo para compatibilidad
    rol: Optional[RolSimpleResponse]  # Nuevo sistema de roles
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AsignarRolRequest(BaseModel):
    """Schema para asignar un rol a un usuario"""

    rol_id: UUID = Field(..., description="ID del rol a asignar")


class CrearOrganizadorRequest(BaseModel):
    """Schema para crear un usuario organizador"""

    email: str = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=8, description="Contraseña del usuario")
    nombre_completo: str = Field(
        ..., min_length=3, description="Nombre completo del usuario"
    )
    rol_id: UUID = Field(..., description="ID del rol a asignar")


# ============================================
# SCHEMAS PARA VERIFICACIÓN DE PERMISOS
# ============================================


class VerificarPermisoRequest(BaseModel):
    """Schema para verificar si un usuario tiene un permiso"""

    permiso_nombre: str = Field(..., description="Nombre del permiso a verificar")


class VerificarPermisoResponse(BaseModel):
    """Schema de respuesta para verificación de permisos"""

    tiene_permiso: bool
    usuario_id: UUID
    permiso_nombre: str


class PermisosUsuarioResponse(BaseModel):
    """Schema de respuesta con todos los permisos de un usuario"""

    usuario_id: UUID
    email: str
    rol: Optional[RolSimpleResponse]
    permisos: List[PermisoResponse]
