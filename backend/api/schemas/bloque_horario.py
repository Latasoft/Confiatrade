"""Schemas para Bloques Horarios"""

from datetime import date, datetime, time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class BloqueHorarioBase(BaseModel):
    """Schema base para Bloque Horario"""

    fecha: date
    hora_inicio: time
    hora_fin: time
    duracion_minutos: int = Field(..., ge=1, le=480)
    ubicacion: Optional[str] = Field(None, max_length=100)
    label: Optional[str] = Field(None, max_length=50)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)


class BloqueHorarioCreate(BloqueHorarioBase):
    """Schema para crear Bloque Horario"""

    evento_id: Optional[UUID] = None


class BloqueHorarioUpdate(BaseModel):
    """Schema para actualizar Bloque Horario"""

    fecha: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    duracion_minutos: Optional[int] = Field(None, ge=1, le=480)
    ubicacion: Optional[str] = Field(None, max_length=100)
    label: Optional[str] = Field(None, max_length=50)
    disponible: Optional[bool] = None
    activo: Optional[bool] = None


class BloqueHorarioResponse(BloqueHorarioBase):
    """Schema de respuesta para Bloque Horario"""

    id: int
    evento_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BloqueHorarioDetailResponse(BloqueHorarioResponse):
    """Schema de respuesta detallado con nombre de evento"""

    evento_nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class BloqueHorarioListResponse(BaseModel):
    """Schema para lista de bloques horarios"""

    bloques: list[BloqueHorarioDetailResponse]
    total: int

    model_config = {"from_attributes": True}


class GenerarBloquesRequest(BaseModel):
    """Schema para generación automática de bloques"""

    evento_id: Optional[UUID] = Field(
        None, description="ID del evento (opcional para bloques genéricos)"
    )
    fecha_inicio: date = Field(..., description="Fecha inicial para generar bloques")
    fecha_fin: date = Field(..., description="Fecha final (inclusive)")
    hora_inicio: time = Field(..., description="Hora de inicio diaria (ej: 09:00)")
    hora_fin: time = Field(..., description="Hora de fin diaria (ej: 17:00)")
    duracion_minutos: int = Field(
        ..., ge=15, le=240, description="Duración de cada bloque en minutos"
    )
    ubicacion: Optional[str] = Field(None, max_length=100)
    label_prefijo: Optional[str] = Field(None, max_length=20)
