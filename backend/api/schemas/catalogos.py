"""Schemas for catalog data."""

from pydantic import BaseModel


class PaisResponse(BaseModel):
    """Response schema for Pais."""

    id: int
    nombre: str
    codigo_iso: str
    activo: bool = True

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        """Convert ORM model to Pydantic model with field mapping."""
        return cls(
            id=obj.id,
            nombre=obj.nombre,
            codigo_iso=obj.codigo,  # Map 'codigo' to 'codigo_iso'
            activo=obj.activo,
        )


class SectorResponse(BaseModel):
    """Response schema for Sector."""

    id: int
    nombre: str
    descripcion: str | None = None
    activo: bool = True

    class Config:
        from_attributes = True
