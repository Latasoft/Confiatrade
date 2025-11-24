"""Repositorio para gestión de Eventos en PostgreSQL"""

from datetime import date
from typing import List, Optional
from uuid import UUID

from models.sqlalchemy.evento_model import EventoModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload


class EventoRepository:
    """Repositorio para operaciones CRUD de Eventos"""

    def __init__(self, db: Session):
        self.db = db

    def create(self, evento_data: dict) -> EventoModel:
        """Crear un nuevo evento"""
        evento = EventoModel(**evento_data)
        self.db.add(evento)
        self.db.commit()
        self.db.refresh(evento)
        
        # Recargar con relaciones para calcular empresas_inscritas
        return self.get_by_id(evento.id)

    def get_by_id(self, evento_id: UUID) -> Optional[EventoModel]:
        """Obtener evento por ID con relaciones cargadas"""
        return (
            self.db.query(EventoModel)
            .options(joinedload(EventoModel.empresas))
            .filter(EventoModel.id == evento_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        activo: Optional[bool] = None,
        estado: Optional[str] = None,
    ) -> List[EventoModel]:
        """Obtener todos los eventos con filtros opcionales"""
        query = self.db.query(EventoModel).options(joinedload(EventoModel.empresas))

        if activo is not None:
            query = query.filter(EventoModel.activo == activo)

        if estado:
            query = query.filter(EventoModel.estado == estado)

        return (
            query.order_by(EventoModel.fecha_inicio.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_eventos_activos(self) -> List[EventoModel]:
        """Obtener eventos activos (planificación o inscripciones abiertas)"""
        return (
            self.db.query(EventoModel)
            .filter(
                EventoModel.activo == True,
                EventoModel.estado.in_(["planificacion", "inscripciones_abiertas"]),
            )
            .order_by(EventoModel.fecha_inicio)
            .all()
        )

    def get_eventos_en_curso(self) -> List[EventoModel]:
        """Obtener eventos en curso"""
        today = date.today()
        return (
            self.db.query(EventoModel)
            .filter(
                EventoModel.activo == True,
                EventoModel.fecha_inicio <= today,
                EventoModel.fecha_fin >= today,
            )
            .all()
        )

    def update(self, evento_id: UUID, update_data: dict) -> Optional[EventoModel]:
        """Actualizar un evento"""
        evento = self.get_by_id(evento_id)
        if not evento:
            return None

        for key, value in update_data.items():
            if value is not None:
                setattr(evento, key, value)

        self.db.commit()
        self.db.refresh(evento)
        
        # Recargar con relaciones para calcular empresas_inscritas
        return self.get_by_id(evento_id)

    def delete(self, evento_id: UUID) -> bool:
        """Eliminar (soft delete) un evento"""
        evento = self.get_by_id(evento_id)
        if not evento:
            return False

        evento.activo = False
        self.db.commit()
        return True

    def count_total(self) -> int:
        """Contar total de eventos"""
        return self.db.query(func.count(EventoModel.id)).scalar()

    def count_activos(self) -> int:
        """Contar eventos activos"""
        return (
            self.db.query(func.count(EventoModel.id))
            .filter(EventoModel.activo == True)
            .scalar()
        )

    def count_finalizados(self) -> int:
        """Contar eventos finalizados"""
        return (
            self.db.query(func.count(EventoModel.id))
            .filter(EventoModel.estado == "finalizado")
            .scalar()
        )
