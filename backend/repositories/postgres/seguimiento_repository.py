"""Repository para Seguimiento"""

from typing import Optional
from uuid import UUID

from models.sqlalchemy.seguimiento_model import SeguimientoModel
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload


class SeguimientoRepository:
    """Repository para gestionar seguimientos en PostgreSQL"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, seguimiento_data: dict) -> SeguimientoModel:
        """Crear un nuevo seguimiento"""
        seguimiento = SeguimientoModel(**seguimiento_data)
        self.db.add(seguimiento)
        self.db.commit()
        self.db.refresh(seguimiento)
        return self.get_by_id(seguimiento.id)

    def get_by_id(self, seguimiento_id: UUID) -> Optional[SeguimientoModel]:
        """Obtener seguimiento por ID con empresa relacionada"""
        from models.sqlalchemy.empresa import EmpresaModel

        stmt = (
            select(SeguimientoModel)
            .options(
                joinedload(SeguimientoModel.empresa).joinedload(EmpresaModel.pais),
                joinedload(SeguimientoModel.empresa).joinedload(EmpresaModel.sector),
            )
            .where(SeguimientoModel.id == seguimiento_id)
        )
        result = self.db.execute(stmt)
        return result.scalar_one_or_none()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        empresa_id: Optional[UUID] = None,
        tipo: Optional[str] = None,
        estado: Optional[str] = None,
    ) -> list[SeguimientoModel]:
        """Obtener lista de seguimientos con filtros"""
        from models.sqlalchemy.empresa import EmpresaModel

        stmt = select(SeguimientoModel).options(
            joinedload(SeguimientoModel.empresa).joinedload(EmpresaModel.pais),
            joinedload(SeguimientoModel.empresa).joinedload(EmpresaModel.sector),
        )

        if empresa_id:
            stmt = stmt.where(SeguimientoModel.empresa_id == empresa_id)
        if tipo:
            stmt = stmt.where(SeguimientoModel.tipo == tipo)
        if estado:
            stmt = stmt.where(SeguimientoModel.estado == estado)

        stmt = (
            stmt.offset(skip).limit(limit).order_by(SeguimientoModel.created_at.desc())
        )

        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def count(
        self,
        empresa_id: Optional[UUID] = None,
        tipo: Optional[str] = None,
        estado: Optional[str] = None,
    ) -> int:
        """Contar seguimientos con filtros"""
        stmt = select(SeguimientoModel)

        if empresa_id:
            stmt = stmt.where(SeguimientoModel.empresa_id == empresa_id)
        if tipo:
            stmt = stmt.where(SeguimientoModel.tipo == tipo)
        if estado:
            stmt = stmt.where(SeguimientoModel.estado == estado)

        result = self.db.execute(stmt)
        return len(list(result.scalars().all()))

    def update(
        self, seguimiento_id: UUID, update_data: dict
    ) -> Optional[SeguimientoModel]:
        """Actualizar seguimiento"""
        seguimiento = self.get_by_id(seguimiento_id)
        if not seguimiento:
            return None

        for key, value in update_data.items():
            if value is not None:
                setattr(seguimiento, key, value)

        self.db.commit()
        self.db.refresh(seguimiento)
        return self.get_by_id(seguimiento_id)

    def delete(self, seguimiento_id: UUID) -> bool:
        """Eliminar seguimiento"""
        seguimiento = self.get_by_id(seguimiento_id)
        if not seguimiento:
            return False

        self.db.delete(seguimiento)
        self.db.commit()
        return True
