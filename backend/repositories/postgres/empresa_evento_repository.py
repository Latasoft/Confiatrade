"""Repository para operaciones de Empresas-Eventos (Inscripciones)"""

from typing import List, Optional
from uuid import UUID

from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload


class EmpresaEventoRepository:
    """Repository para gestionar inscripciones de empresas a eventos"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, inscripcion_data: dict) -> EmpresaEventoModel:
        """Crear nueva inscripción de empresa a evento"""
        inscripcion = EmpresaEventoModel(**inscripcion_data)
        self.db.add(inscripcion)
        self.db.commit()
        self.db.refresh(inscripcion)

        # Recargar con relaciones para evitar errores de serialización
        return self.get_by_id(inscripcion.id)

    def get_by_id(self, inscripcion_id: UUID) -> Optional[EmpresaEventoModel]:
        """Obtener inscripción por ID"""
        return (
            self.db.query(EmpresaEventoModel)
            .options(joinedload(EmpresaEventoModel.empresa))
            .options(joinedload(EmpresaEventoModel.evento))
            .filter(EmpresaEventoModel.id == inscripcion_id)
            .first()
        )

    def get_by_empresa_evento(
        self, empresa_id: UUID, evento_id: UUID
    ) -> Optional[EmpresaEventoModel]:
        """Obtener inscripción específica de empresa en evento"""
        return (
            self.db.query(EmpresaEventoModel)
            .filter(
                EmpresaEventoModel.empresa_id == empresa_id,
                EmpresaEventoModel.evento_id == evento_id,
            )
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        evento_id: Optional[UUID] = None,
        empresa_id: Optional[UUID] = None,
        aprobada: Optional[bool] = None,
    ) -> List[EmpresaEventoModel]:
        """Obtener lista de inscripciones con filtros"""
        query = self.db.query(EmpresaEventoModel).options(
            joinedload(EmpresaEventoModel.empresa),
            joinedload(EmpresaEventoModel.evento),
        )

        if evento_id is not None:
            query = query.filter(EmpresaEventoModel.evento_id == evento_id)

        if empresa_id is not None:
            query = query.filter(EmpresaEventoModel.empresa_id == empresa_id)

        if aprobada is not None:
            query = query.filter(EmpresaEventoModel.aprobada == aprobada)

        return (
            query.order_by(EmpresaEventoModel.fecha_inscripcion.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_empresas_by_evento(
        self, evento_id: UUID, aprobada: Optional[bool] = None
    ) -> List[EmpresaEventoModel]:
        """Obtener todas las empresas inscritas en un evento"""
        query = (
            self.db.query(EmpresaEventoModel)
            .options(joinedload(EmpresaEventoModel.empresa))
            .filter(EmpresaEventoModel.evento_id == evento_id)
        )

        if aprobada is not None:
            query = query.filter(EmpresaEventoModel.aprobada == aprobada)

        return query.order_by(EmpresaEventoModel.fecha_inscripcion).all()

    def get_eventos_by_empresa(
        self, empresa_id: UUID, aprobada: Optional[bool] = None
    ) -> List[EmpresaEventoModel]:
        """Obtener todos los eventos en los que está inscrita una empresa"""
        query = (
            self.db.query(EmpresaEventoModel)
            .options(joinedload(EmpresaEventoModel.evento))
            .filter(EmpresaEventoModel.empresa_id == empresa_id)
        )

        if aprobada is not None:
            query = query.filter(EmpresaEventoModel.aprobada == aprobada)

        return query.order_by(EmpresaEventoModel.fecha_inscripcion.desc()).all()

    def update(
        self, inscripcion_id: UUID, update_data: dict
    ) -> Optional[EmpresaEventoModel]:
        """Actualizar inscripción (aprobar/rechazar)"""
        inscripcion = self.get_by_id(inscripcion_id)
        if not inscripcion:
            return None

        for key, value in update_data.items():
            setattr(inscripcion, key, value)

        self.db.commit()
        self.db.refresh(inscripcion)

        # Recargar con relaciones para evitar errores de serialización
        return self.get_by_id(inscripcion_id)

    def delete(self, inscripcion_id: UUID) -> bool:
        """Eliminar inscripción (hard delete)"""
        inscripcion = self.get_by_id(inscripcion_id)
        if not inscripcion:
            return False

        self.db.delete(inscripcion)
        self.db.commit()
        return True

    def count_total(self, evento_id: Optional[UUID] = None) -> int:
        """Contar total de inscripciones"""
        query = self.db.query(func.count(EmpresaEventoModel.id))

        if evento_id is not None:
            query = query.filter(EmpresaEventoModel.evento_id == evento_id)

        return query.scalar() or 0

    def count_aprobadas(self, evento_id: Optional[UUID] = None) -> int:
        """Contar inscripciones aprobadas"""
        query = self.db.query(func.count(EmpresaEventoModel.id)).filter(
            EmpresaEventoModel.aprobada == True
        )

        if evento_id is not None:
            query = query.filter(EmpresaEventoModel.evento_id == evento_id)

        return query.scalar() or 0

    def count_pendientes(self, evento_id: Optional[UUID] = None) -> int:
        """Contar inscripciones pendientes"""
        query = self.db.query(func.count(EmpresaEventoModel.id)).filter(
            EmpresaEventoModel.aprobada == False
        )

        if evento_id is not None:
            query = query.filter(EmpresaEventoModel.evento_id == evento_id)

        return query.scalar() or 0
