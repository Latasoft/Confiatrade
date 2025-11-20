"""Use case: Eliminar Bloque Horario"""

from core.exceptions import NotFoundException
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository


class EliminarBloqueHorarioUseCase:
    """Use case para eliminar bloque horario"""

    def __init__(self, bloque_repository: BloqueHorarioRepository):
        self.bloque_repository = bloque_repository

    def execute(self, bloque_id: int):
        """Eliminar bloque con validación"""
        # Validar que existe
        bloque = self.bloque_repository.get_by_id(bloque_id)
        if not bloque:
            raise NotFoundException(
                message=f"Bloque horario con ID {bloque_id} no encontrado",
                details={"bloque_id": bloque_id},
            )

        # Eliminar
        eliminado = self.bloque_repository.delete(bloque_id)

        return {
            "success": eliminado,
            "message": "Bloque horario eliminado exitosamente",
        }
