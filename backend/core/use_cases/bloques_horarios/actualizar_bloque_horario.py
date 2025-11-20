"""Use case: Actualizar Bloque Horario"""

from datetime import date, time
from typing import Optional

from core.exceptions import NotFoundException, ValidationException
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository


class ActualizarBloqueHorarioUseCase:
    """Use case para actualizar bloque horario"""

    def __init__(self, bloque_repository: BloqueHorarioRepository):
        self.bloque_repository = bloque_repository

    def execute(
        self,
        bloque_id: int,
        fecha: Optional[date] = None,
        hora_inicio: Optional[time] = None,
        hora_fin: Optional[time] = None,
        duracion_minutos: Optional[int] = None,
        ubicacion: Optional[str] = None,
        label: Optional[str] = None,
        activo: Optional[bool] = None,
    ):
        """
        Actualizar bloque horario con validaciones:
        - Bloque debe existir
        - Si se modifican horas, validar coherencia
        """
        # 1. Validar que bloque existe
        bloque = self.bloque_repository.get_by_id(bloque_id)
        if not bloque:
            raise NotFoundException(
                message=f"Bloque horario con ID {bloque_id} no encontrado",
                details={"bloque_id": bloque_id},
            )

        # 2. Validar coherencia horaria si se modifican
        hora_inicio_final = hora_inicio if hora_inicio else bloque.hora_inicio
        hora_fin_final = hora_fin if hora_fin else bloque.hora_fin

        if hora_fin_final <= hora_inicio_final:
            raise ValidationException(
                message="hora_fin debe ser posterior a hora_inicio",
                details={
                    "hora_inicio": str(hora_inicio_final),
                    "hora_fin": str(hora_fin_final),
                },
            )

        # 3. Actualizar bloque
        bloque_actualizado = self.bloque_repository.update(
            bloque_id=bloque_id,
            fecha=fecha,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            duracion_minutos=duracion_minutos,
            ubicacion=ubicacion,
            label=label,
            activo=activo,
        )

        return bloque_actualizado
