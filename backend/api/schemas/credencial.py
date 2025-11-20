"""Schemas Pydantic para credenciales"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CredencialGeneradaBase(BaseModel):
    """Base para credencial generada"""

    tipo: str  # 'empresa' o 'participante'
    formato: str  # 'badge' o 'lanyard'


class CredencialGeneradaResponse(CredencialGeneradaBase):
    """Response para credencial generada individual"""

    id: UUID
    empresa_id: Optional[UUID] = None
    participante_id: Optional[UUID] = None
    fecha_generacion: datetime
    generada_por: Optional[UUID] = None
    pdf_hash: str

    class Config:
        from_attributes = True


class EntidadInfo(BaseModel):
    """Información básica de entidad (empresa o participante)"""

    id: UUID
    nombre: str
    email: str
    empresa: Optional[str] = None  # Solo para participantes


class CredencialHistorialItem(BaseModel):
    """Item del historial de credenciales"""

    id: UUID
    tipo: str
    fecha_generacion: datetime
    formato: str
    pdf_hash: str
    entidad: Optional[EntidadInfo] = None

    class Config:
        from_attributes = True


class CredencialHistorialResponse(BaseModel):
    """Response paginada del historial"""

    total: int
    skip: int
    limit: int
    items: list[CredencialHistorialItem]


class CredencialesStatsResponse(BaseModel):
    """Estadísticas de credenciales"""

    total_empresas_aprobadas: int
    total_participantes: int
    credenciales_generadas: int
    credenciales_empresas: int
    credenciales_participantes: int
    pendientes: int
    ultima_generacion: Optional[datetime] = None
