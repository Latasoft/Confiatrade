"""Schemas para Curaduría"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class CuraduriaBase(BaseModel):
    """Schema base para Curaduría"""

    ofrece: Optional[str] = Field(None, description="Productos/servicios que ofrece")
    busca: Optional[str] = Field(None, description="Productos/servicios que busca")
    objetivos: Optional[str] = Field(None, description="Objetivos de participación")
    capacidades: Optional[str] = Field(None, description="Capacidades técnicas")
    notas_internas: Optional[str] = Field(None, description="Notas para curadores")


class CuraduriaCreate(CuraduriaBase):
    """Schema para crear Curaduría"""

    empresa_id: UUID


class CuraduriaUpdate(CuraduriaBase):
    """Schema para actualizar Curaduría"""

    pass


class CuraduriaResponse(CuraduriaBase):
    """Schema de respuesta para Curaduría"""

    id: UUID
    empresa_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CuraduriaDetailResponse(CuraduriaResponse):
    """Schema de respuesta detallado con datos de empresa"""

    empresa_nombre: Optional[str] = None
    empresa_sector: Optional[str] = None
    empresa_pais: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def extract_empresa_data(cls, data):
        """Extraer datos de empresa desde el modelo SQLAlchemy"""
        if hasattr(data, "empresa") and data.empresa:
            empresa = data.empresa
            data.empresa_nombre = empresa.nombre
            data.empresa_sector = (
                empresa.sector.nombre
                if hasattr(empresa, "sector") and empresa.sector
                else None
            )
            data.empresa_pais = (
                empresa.pais.nombre
                if hasattr(empresa, "pais") and empresa.pais
                else None
            )
        return data

    model_config = {"from_attributes": True}


class CuraduriaListResponse(BaseModel):
    """Schema para lista de curadurías"""

    curaduria: list[CuraduriaDetailResponse]
    total: int

    model_config = {"from_attributes": True}


class MatchScore(BaseModel):
    """Schema para resultado de matching"""

    empresa_a_id: UUID
    empresa_a_nombre: str
    empresa_b_id: UUID
    empresa_b_nombre: str
    score: int = Field(..., description="Puntuación total del match")
    sector_match: bool = Field(..., description="¿Mismo sector?")
    keywords_ofrece_busca: list[str] = Field(
        default_factory=list,
        description="Keywords que coinciden entre ofrece A y busca B",
    )
    keywords_busca_ofrece: list[str] = Field(
        default_factory=list,
        description="Keywords que coinciden entre busca A y ofrece B",
    )
    detalles: dict = Field(default_factory=dict, description="Detalles adicionales")

    model_config = {"from_attributes": True}


class MatchListResponse(BaseModel):
    """Schema para lista de matches"""

    matches: list[MatchScore]
    total: int

    model_config = {"from_attributes": True}
