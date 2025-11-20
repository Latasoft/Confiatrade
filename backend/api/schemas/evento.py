"""Schemas para el módulo de Eventos"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class EventoBase(BaseModel):
    """Schema base para Evento"""

    nombre: str = Field(
        ..., min_length=3, max_length=255, description="Nombre del evento"
    )
    ubicacion: Optional[str] = Field(
        None, min_length=2, max_length=150, description="Ubicación del evento"
    )
    pais_sede: str = Field(
        ..., min_length=2, max_length=100, description="País sede del evento"
    )
    fecha_inicio: date = Field(..., description="Fecha de inicio del evento")
    fecha_fin: date = Field(..., description="Fecha de fin del evento")
    estado: Optional[str] = Field(
        default="planificacion",
        pattern="^(planificacion|inscripcion_abierta|en_curso|finalizado|cancelado)$",
        description="Estado del evento",
    )
    descripcion: Optional[str] = Field(None, description="Descripción del evento")
    capacidad_empresas: Optional[int] = Field(
        default=50, ge=1, le=1000, description="Capacidad máxima de empresas"
    )

    @model_validator(mode="after")
    def validate_fechas(self):
        """Validar que fecha_fin sea mayor o igual a fecha_inicio"""
        if self.fecha_fin < self.fecha_inicio:
            raise ValueError("fecha_fin debe ser mayor o igual a fecha_inicio")
        return self


class EventoCreate(EventoBase):
    """Schema para crear un Evento"""

    pass


class EventoUpdate(BaseModel):
    """Schema para actualizar un Evento"""

    nombre: Optional[str] = Field(None, min_length=3, max_length=255)
    ubicacion: Optional[str] = Field(None, min_length=2, max_length=150)
    pais_sede: Optional[str] = Field(None, min_length=2, max_length=100)
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: Optional[str] = Field(
        None,
        pattern="^(planificacion|inscripcion_abierta|en_curso|finalizado|cancelado)$",
    )
    descripcion: Optional[str] = None
    capacidad_empresas: Optional[int] = Field(None, ge=1, le=1000)
    activo: Optional[bool] = None


class EventoResponse(EventoBase):
    """Schema de respuesta para Evento"""

    id: UUID
    estado: str
    activo: bool
    empresas_inscritas: int = Field(
        default=0, description="Número de empresas inscritas"
    )
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventoListResponse(BaseModel):
    """Schema para lista de eventos con metadata"""

    eventos: list[EventoResponse]
    total: int
    activos: int
    finalizados: int
