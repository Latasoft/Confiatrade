"""Use case: Obtener Bloque Horario por ID"""

from core.exceptions import NotFoundException
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository


class GetBloqueHorarioByIdUseCase:
    """Use case para obtener un bloque horario por ID"""

    def __init__(self, bloque_repository: BloqueHorarioRepository):
        self.bloque_repository = bloque_repository

    def execute(self, bloque_id: int):
        """Obtener bloque por ID con validación"""
        bloque = self.bloque_repository.get_by_id(bloque_id)

        if not bloque:
            raise NotFoundException(
                message=f"Bloque horario con ID {bloque_id} no encontrado",
                details={"bloque_id": bloque_id},
            )

        return bloque
