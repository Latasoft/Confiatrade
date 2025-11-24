from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class EmpresaBase(BaseModel):
    nombre: str
    pais_id: int
    sector_id: int
    descripcion: Optional[str] = None
    sitio_web: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    sitio_web: Optional[str] = None
    direccion: Optional[str] = None
    presentacion_url: Optional[str] = None


class EmpresaResponse(EmpresaBase):
    id: UUID
    logo_url: Optional[str] = None
    presentacion_url: Optional[str] = None
    aprobada: bool
    fecha_registro: datetime
    updated_at: datetime
    pais_nombre: Optional[str] = None
    sector_nombre: Optional[str] = None

    class Config:
        from_attributes = True
