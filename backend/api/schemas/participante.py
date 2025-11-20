"""Schemas para Participantes"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ParticipanteBase(BaseModel):
    """Schema base para Participante"""

    nombre_completo: str = Field(..., min_length=1, max_length=255)
    cargo: Optional[str] = Field(None, max_length=150)
    email: EmailStr
    telefono: Optional[str] = Field(None, max_length=50)
    idioma: str = Field(default="ES", max_length=2)
    requiere_interprete: bool = Field(default=False)
    foto_url: Optional[str] = Field(None, max_length=500)


class ParticipanteCreate(ParticipanteBase):
    """Schema para crear Participante"""

    empresa_id: UUID


class ParticipanteUpdate(BaseModel):
    """Schema para actualizar Participante"""

    nombre_completo: Optional[str] = Field(None, min_length=1, max_length=255)
    cargo: Optional[str] = Field(None, max_length=150)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=50)
    idioma: Optional[str] = Field(None, max_length=2)
    requiere_interprete: Optional[bool] = None
    foto_url: Optional[str] = Field(None, max_length=500)
    check_in_realizado: Optional[bool] = None


class ParticipanteResponse(ParticipanteBase):
    """Schema de respuesta para Participante"""

    id: UUID
    empresa_id: UUID
    qr_data: Optional[str] = None
    check_in_realizado: bool = False
    fecha_check_in: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ParticipanteDetailResponse(ParticipanteResponse):
    """Schema de respuesta detallado con datos de empresa"""

    empresa_nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class ParticipanteListResponse(BaseModel):
    """Schema para lista de participantes"""

    participantes: list[ParticipanteDetailResponse]
    total: int

    model_config = {"from_attributes": True}
