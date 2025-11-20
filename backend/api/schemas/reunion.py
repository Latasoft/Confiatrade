"""Schemas para Reuniones"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ReunionBase(BaseModel):
    """Schema base para Reunión"""

    bloque_id: int
    empresa_a_id: UUID
    empresa_b_id: UUID
    estado: str = Field(default="programada", max_length=50)
    notas: Optional[str] = None
    requiere_interprete: bool = Field(default=False)
    sala: Optional[str] = Field(None, max_length=50)
    resultado: Optional[str] = None


class ReunionCreate(ReunionBase):
    """Schema para crear Reunión"""

    pass


class ReunionUpdate(BaseModel):
    """Schema para actualizar Reunión"""

    estado: Optional[str] = Field(None, max_length=50)
    notas: Optional[str] = None
    requiere_interprete: Optional[bool] = None
    sala: Optional[str] = Field(None, max_length=50)
    resultado: Optional[str] = None


class ReunionResponse(ReunionBase):
    """Schema de respuesta para Reunión"""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReunionDetailResponse(ReunionResponse):
    """Schema de respuesta detallado con datos de empresas y bloque"""

    empresa_a_nombre: Optional[str] = None
    empresa_b_nombre: Optional[str] = None
    bloque_fecha: Optional[str] = None
    bloque_hora_inicio: Optional[str] = None
    bloque_hora_fin: Optional[str] = None
    bloque_ubicacion: Optional[str] = None
    evento_id: Optional[UUID] = None
    evento_nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class ReunionListResponse(BaseModel):
    """Schema para lista de reuniones"""

    reuniones: list[ReunionDetailResponse]
    total: int

    model_config = {"from_attributes": True}
