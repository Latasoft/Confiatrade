"""Repository para Bloques Horarios"""

from datetime import date, time
from typing import Optional
from uuid import UUID

from models.sqlalchemy import BloqueHorarioModel
from sqlalchemy.orm import Session, joinedload


class BloqueHorarioRepository:
    """Repository para gestión de bloques horarios"""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        fecha: date,
        hora_inicio: time,
        hora_fin: time,
        duracion_minutos: int,
        evento_id: Optional[UUID] = None,
        ubicacion: Optional[str] = None,
        label: Optional[str] = None,
        activo: bool = True,
    ) -> BloqueHorarioModel:
        """Crear un nuevo bloque horario"""
        bloque = BloqueHorarioModel(
            evento_id=evento_id,
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            duracion_minutos=duracion_minutos,
            ubicacion=ubicacion,
            label=label,
            activo=activo,
        )
        self.db.add(bloque)
        self.db.commit()
        self.db.refresh(bloque)
        return bloque

    def get_by_id(self, bloque_id: int) -> Optional[BloqueHorarioModel]:
        """Obtener bloque por ID con evento cargado"""
        return (
            self.db.query(BloqueHorarioModel)
            .options(joinedload(BloqueHorarioModel.evento))
            .filter(BloqueHorarioModel.id == bloque_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        evento_id: Optional[UUID] = None,
        fecha: Optional[date] = None,
        activo: Optional[bool] = None,
    ) -> list[BloqueHorarioModel]:
        """Obtener todos los bloques con filtros opcionales"""
        query = self.db.query(BloqueHorarioModel).options(
            joinedload(BloqueHorarioModel.evento)
        )

        if evento_id is not None:
            query = query.filter(BloqueHorarioModel.evento_id == evento_id)

        if fecha is not None:
            query = query.filter(BloqueHorarioModel.fecha == fecha)

        if activo is not None:
            query = query.filter(BloqueHorarioModel.activo == activo)

        return (
            query.order_by(BloqueHorarioModel.fecha, BloqueHorarioModel.hora_inicio)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_evento(self, evento_id: UUID) -> list[BloqueHorarioModel]:
        """Obtener todos los bloques de un evento"""
        return (
            self.db.query(BloqueHorarioModel)
            .options(joinedload(BloqueHorarioModel.evento))
            .filter(BloqueHorarioModel.evento_id == evento_id)
            .order_by(BloqueHorarioModel.fecha, BloqueHorarioModel.hora_inicio)
            .all()
        )

    def get_by_fecha_range(
        self, fecha_inicio: date, fecha_fin: date, evento_id: Optional[UUID] = None
    ) -> list[BloqueHorarioModel]:
        """Obtener bloques en un rango de fechas"""
        query = (
            self.db.query(BloqueHorarioModel)
            .options(joinedload(BloqueHorarioModel.evento))
            .filter(
                BloqueHorarioModel.fecha >= fecha_inicio,
                BloqueHorarioModel.fecha <= fecha_fin,
            )
        )

        if evento_id is not None:
            query = query.filter(BloqueHorarioModel.evento_id == evento_id)

        return query.order_by(
            BloqueHorarioModel.fecha, BloqueHorarioModel.hora_inicio
        ).all()

    def update(
        self,
        bloque_id: int,
        fecha: Optional[date] = None,
        hora_inicio: Optional[time] = None,
        hora_fin: Optional[time] = None,
        duracion_minutos: Optional[int] = None,
        ubicacion: Optional[str] = None,
        label: Optional[str] = None,
        disponible: Optional[bool] = None,
        activo: Optional[bool] = None,
    ) -> Optional[BloqueHorarioModel]:
        """Actualizar bloque horario"""
        bloque = self.get_by_id(bloque_id)
        if not bloque:
            return None

        if fecha is not None:
            bloque.fecha = fecha
        if hora_inicio is not None:
            bloque.hora_inicio = hora_inicio
        if hora_fin is not None:
            bloque.hora_fin = hora_fin
        if duracion_minutos is not None:
            bloque.duracion_minutos = duracion_minutos
        if ubicacion is not None:
            bloque.ubicacion = ubicacion
        if label is not None:
            bloque.label = label
        if disponible is not None:
            bloque.disponible = disponible
        if activo is not None:
            bloque.activo = activo

        self.db.commit()
        self.db.refresh(bloque)
        return bloque

    def delete(self, bloque_id: int) -> bool:
        """Eliminar bloque (hard delete)"""
        bloque = self.get_by_id(bloque_id)
        if not bloque:
            return False

        self.db.delete(bloque)
        self.db.commit()
        return True

    def count_total(
        self,
        evento_id: Optional[UUID] = None,
        fecha: Optional[date] = None,
        activo: Optional[bool] = None,
    ) -> int:
        """Contar total de bloques"""
        from sqlalchemy import func

        query = self.db.query(func.count(BloqueHorarioModel.id))

        if evento_id is not None:
            query = query.filter(BloqueHorarioModel.evento_id == evento_id)

        if fecha is not None:
            query = query.filter(BloqueHorarioModel.fecha == fecha)

        if activo is not None:
            query = query.filter(BloqueHorarioModel.activo == activo)

        return query.scalar() or 0

    def bulk_create(
        self, bloques: list[BloqueHorarioModel]
    ) -> list[BloqueHorarioModel]:
        """Crear múltiples bloques en una transacción"""
        self.db.add_all(bloques)
        self.db.commit()
        for bloque in bloques:
            self.db.refresh(bloque)
        return bloques
