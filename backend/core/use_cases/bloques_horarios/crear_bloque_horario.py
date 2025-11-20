"""Use case: Crear Bloque Horario"""

from datetime import date, time
from typing import Optional
from uuid import UUID

from core.exceptions import NotFoundException, ValidationException
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository
from repositories.postgres.evento_repository import EventoRepository


class CrearBloqueHorarioUseCase:
    """Use case para crear bloque horario con validaciones"""

    def __init__(
        self,
        bloque_repository: BloqueHorarioRepository,
        evento_repository: EventoRepository,
    ):
        self.bloque_repository = bloque_repository
        self.evento_repository = evento_repository

    def execute(
        self,
        fecha: date,
        hora_inicio: time,
        hora_fin: time,
        duracion_minutos: int,
        evento_id: Optional[UUID] = None,
        ubicacion: Optional[str] = None,
        label: Optional[str] = None,
        activo: bool = True,
    ):
        """
        Crear bloque horario con validaciones:
        - Si se especifica evento_id, validar que existe
        - Validar que hora_fin > hora_inicio
        """
        # 1. Si hay evento_id, validar que existe
        if evento_id is not None:
            evento = self.evento_repository.get_by_id(evento_id)
            if not evento:
                raise NotFoundException(
                    message=f"Evento con ID {evento_id} no encontrado",
                    details={"evento_id": str(evento_id)},
                )

        # 2. Validar coherencia horaria
        if hora_fin <= hora_inicio:
            raise ValidationException(
                message="hora_fin debe ser posterior a hora_inicio",
                details={"hora_inicio": str(hora_inicio), "hora_fin": str(hora_fin)},
            )

        # 3. Crear bloque
        bloque = self.bloque_repository.create(
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            duracion_minutos=duracion_minutos,
            evento_id=evento_id,
            ubicacion=ubicacion,
            label=label,
            activo=activo,
        )

        return bloque
