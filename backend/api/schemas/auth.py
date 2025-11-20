"""Schemas para autenticación"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre_completo: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    password: str = Field(
        ..., min_length=8, description="Contraseña mínimo 8 caracteres"
    )
    rol: str = Field(default="empresa", pattern="^(admin|empresa)$")
    empresa_id: Optional[UUID] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class UsuarioResponse(UsuarioBase):
    id: UUID
    rol: str
    empresa_id: Optional[UUID] = None
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioResponse


class EmpresaRegistro(BaseModel):
    """Datos para registro de empresa con usuario"""

    # Datos de usuario
    email: EmailStr
    password: str = Field(..., min_length=8)
    nombre_completo: str = Field(..., min_length=2)

    # Datos de empresa
    nombre_empresa: str = Field(..., min_length=2)
    pais_id: int
    sector_id: int
    descripcion: Optional[str] = None
    sitio_web: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v


class PerfilUsuario(BaseModel):
    """Perfil completo del usuario con datos de empresa si aplica"""

    id: UUID
    email: str
    nombre_completo: Optional[str]
    rol: str
    activo: bool
    created_at: datetime
    empresa: Optional[dict] = None  # Incluye datos de empresa si es rol empresa

    class Config:
        from_attributes = True


class CambiarPassword(BaseModel):
    password_actual: str
    password_nuevo: str = Field(..., min_length=8)

    @field_validator("password_nuevo")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v
