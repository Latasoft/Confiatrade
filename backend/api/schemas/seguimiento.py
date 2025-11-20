"""Schemas para Seguimiento"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class SeguimientoBase(BaseModel):
    """Base schema para Seguimiento"""

    tipo: str = Field(..., description="Tipo: acuerdo, loi, seguimiento")
    descripcion: str = Field(..., min_length=1, max_length=1000)
    estado: str = Field(
        default="pendiente",
        description="Estado: pendiente, en_proceso, completado, cancelado",
    )
    responsable: Optional[str] = Field(None, max_length=255)
    fecha_compromiso: Optional[date] = None
    resultado: Optional[str] = Field(
        None,
        max_length=50,
        description="Resultado: acuerdo_cerrado, loi_firmada, sin_acuerdo, etc.",
    )
    monto_estimado: Optional[float] = Field(
        None, ge=0, description="Monto estimado del acuerdo"
    )
    notas: Optional[str] = None

    @field_validator("tipo")
    @classmethod
    def validate_tipo(cls, v: str) -> str:
        allowed = ["acuerdo", "loi", "seguimiento"]
        if v not in allowed:
            raise ValueError(f"Tipo debe ser uno de: {', '.join(allowed)}")
        return v

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v: str) -> str:
        allowed = ["pendiente", "en_proceso", "completado", "cancelado"]
        if v not in allowed:
            raise ValueError(f"Estado debe ser uno de: {', '.join(allowed)}")
        return v


class SeguimientoCreate(SeguimientoBase):
    """Schema para crear seguimiento"""

    empresa_id: UUID = Field(..., description="ID de la empresa")


class SeguimientoUpdate(BaseModel):
    """Schema para actualizar seguimiento (todos los campos opcionales)"""

    tipo: Optional[str] = None
    descripcion: Optional[str] = Field(None, min_length=1, max_length=1000)
    estado: Optional[str] = None
    responsable: Optional[str] = Field(None, max_length=255)
    fecha_compromiso: Optional[date] = None
    resultado: Optional[str] = Field(None, max_length=50)
    monto_estimado: Optional[float] = Field(None, ge=0)
    notas: Optional[str] = None

    @field_validator("tipo")
    @classmethod
    def validate_tipo(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = ["acuerdo", "loi", "seguimiento"]
            if v not in allowed:
                raise ValueError(f"Tipo debe ser uno de: {', '.join(allowed)}")
        return v

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = ["pendiente", "en_proceso", "completado", "cancelado"]
            if v not in allowed:
                raise ValueError(f"Estado debe ser uno de: {', '.join(allowed)}")
        return v


class SeguimientoResponse(SeguimientoBase):
    """Schema para respuesta de seguimiento"""

    id: UUID
    empresa_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SeguimientoDetailResponse(SeguimientoResponse):
    """Schema detallado con información de empresa"""

    empresa_nombre: Optional[str] = None
    empresa_pais: Optional[str] = None
    empresa_sector: Optional[str] = None


class SeguimientoListResponse(BaseModel):
    """Schema para lista de seguimientos"""

    seguimientos: list[SeguimientoDetailResponse]
    total: int
