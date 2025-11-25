"""Repository para Reuniones"""

from typing import Optional
from uuid import UUID

from models.sqlalchemy import BloqueHorarioModel, ReunionModel
from sqlalchemy.orm import Session, joinedload


class ReunionRepository:
    """Repository para gestión de reuniones"""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        bloque_id: int,
        empresa_a_id: UUID,
        empresa_b_id: UUID,
        estado: str = "programada",
        notas: Optional[str] = None,
        requiere_interprete: bool = False,
        sala: Optional[str] = None,
        resultado: Optional[str] = None,
    ) -> ReunionModel:
        """Crear una nueva reunión"""
        reunion = ReunionModel(
            bloque_id=bloque_id,
            empresa_a_id=empresa_a_id,
            empresa_b_id=empresa_b_id,
            estado=estado,
            notas=notas,
            requiere_interprete=requiere_interprete,
            sala=sala,
            resultado=resultado,
        )
        self.db.add(reunion)
        self.db.commit()
        self.db.refresh(reunion)

        # Recargar con relaciones para evitar errores de serialización
        return self.get_by_id(reunion.id)

    def get_by_id(self, reunion_id: UUID) -> Optional[ReunionModel]:
        """Obtener reunión por ID con relaciones cargadas"""
        return (
            self.db.query(ReunionModel)
            .options(
                joinedload(ReunionModel.bloque).joinedload(BloqueHorarioModel.evento),
                joinedload(ReunionModel.empresa_a),
                joinedload(ReunionModel.empresa_b),
            )
            .filter(ReunionModel.id == reunion_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        empresa_id: Optional[UUID] = None,
        bloque_id: Optional[int] = None,
        estado: Optional[str] = None,
        sala: Optional[str] = None,
        evento_id: Optional[UUID] = None,
    ) -> list[ReunionModel]:
        """Obtener todas las reuniones con filtros opcionales"""
        query = self.db.query(ReunionModel).options(
            joinedload(ReunionModel.bloque).joinedload(BloqueHorarioModel.evento),
            joinedload(ReunionModel.empresa_a),
            joinedload(ReunionModel.empresa_b),
        )

        if empresa_id is not None:
            query = query.filter(
                (ReunionModel.empresa_a_id == empresa_id)
                | (ReunionModel.empresa_b_id == empresa_id)
            )

        if bloque_id is not None:
            query = query.filter(ReunionModel.bloque_id == bloque_id)

        if estado is not None:
            query = query.filter(ReunionModel.estado == estado)

        if sala is not None:
            query = query.filter(ReunionModel.sala.ilike(f"%{sala}%"))

        if evento_id is not None:
            query = query.join(BloqueHorarioModel).filter(
                BloqueHorarioModel.evento_id == evento_id
            )

        return query.offset(skip).limit(limit).all()

    def get_by_bloque(self, bloque_id: int) -> list[ReunionModel]:
        """Obtener todas las reuniones de un bloque"""
        return (
            self.db.query(ReunionModel)
            .options(
                joinedload(ReunionModel.empresa_a),
                joinedload(ReunionModel.empresa_b),
            )
            .filter(ReunionModel.bloque_id == bloque_id)
            .all()
        )

    def check_empresa_disponible_en_bloque(
        self, bloque_id: int, empresa_id: UUID
    ) -> bool:
        """Verificar si una empresa está disponible en un bloque (no tiene reunión)"""
        reunion_existente = (
            self.db.query(ReunionModel)
            .filter(
                ReunionModel.bloque_id == bloque_id,
                (ReunionModel.empresa_a_id == empresa_id)
                | (ReunionModel.empresa_b_id == empresa_id),
            )
            .first()
        )
        return reunion_existente is None

    def update(
        self,
        reunion_id: UUID,
        estado: Optional[str] = None,
        notas: Optional[str] = None,
        requiere_interprete: Optional[bool] = None,
        sala: Optional[str] = None,
        resultado: Optional[str] = None,
    ) -> Optional[ReunionModel]:
        """Actualizar reunión"""
        reunion = self.get_by_id(reunion_id)
        if not reunion:
            return None

        if estado is not None:
            reunion.estado = estado
        if notas is not None:
            reunion.notas = notas
        if requiere_interprete is not None:
            reunion.requiere_interprete = requiere_interprete
        if sala is not None:
            reunion.sala = sala
        if resultado is not None:
            reunion.resultado = resultado

        self.db.commit()
        self.db.refresh(reunion)

        # Recargar con relaciones para evitar errores de serialización
        return self.get_by_id(reunion_id)

    def delete(self, reunion_id: UUID) -> bool:
        """Eliminar reunión (hard delete)"""
        reunion = self.get_by_id(reunion_id)
        if not reunion:
            return False

        self.db.delete(reunion)
        self.db.commit()
        return True

    def count_total(
        self,
        empresa_id: Optional[UUID] = None,
        estado: Optional[str] = None,
        evento_id: Optional[UUID] = None,
    ) -> int:
        """Contar total de reuniones"""
        from sqlalchemy import func

        query = self.db.query(func.count(ReunionModel.id))

        if empresa_id is not None:
            query = query.filter(
                (ReunionModel.empresa_a_id == empresa_id)
                | (ReunionModel.empresa_b_id == empresa_id)
            )

        if estado is not None:
            query = query.filter(ReunionModel.estado == estado)

        if evento_id is not None:
            query = query.join(BloqueHorarioModel).filter(
                BloqueHorarioModel.evento_id == evento_id
            )

        return query.scalar() or 0
