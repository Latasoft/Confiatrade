"""Schemas para el módulo de Empresas-Eventos (Inscripciones)"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class EmpresaEventoBase(BaseModel):
    """Schema base para EmpresaEvento"""

    empresa_id: UUID = Field(..., description="ID de la empresa")
    evento_id: UUID = Field(..., description="ID del evento")


class EmpresaEventoCreate(EmpresaEventoBase):
    """Schema para inscribir una empresa a un evento"""

    pass


class EmpresaEventoUpdate(BaseModel):
    """Schema para actualizar inscripción (aprobar/rechazar)"""

    aprobada: bool = Field(..., description="Estado de aprobación")


class EmpresaEventoResponse(EmpresaEventoBase):
    """Schema de respuesta para inscripción"""

    id: UUID
    aprobada: Optional[bool] = None  # None=Pendiente, True=Aprobada, False=Rechazada
    fecha_inscripcion: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmpresaEventoDetailResponse(EmpresaEventoResponse):
    """Schema de respuesta con información de empresa y evento"""

    empresa_nombre: Optional[str] = None
    evento_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class EmpresaEventoListResponse(BaseModel):
    """Schema para lista de inscripciones con metadata"""

    inscripciones: list[EmpresaEventoDetailResponse]
    total: int
    aprobadas: int
    pendientes: int
