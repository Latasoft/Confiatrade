"""Use case: Eliminar Reunión"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository
from repositories.postgres.reunion_repository import ReunionRepository


class EliminarReunionUseCase:
    """Use case para eliminar reunión"""

    def __init__(
        self,
        reunion_repository: ReunionRepository,
        bloque_repository: BloqueHorarioRepository,
    ):
        self.reunion_repository = reunion_repository
        self.bloque_repository = bloque_repository

    def execute(self, reunion_id: UUID):
        """Eliminar reunión con validación y liberar bloque"""
        # Validar que existe
        reunion = self.reunion_repository.get_by_id(reunion_id)
        if not reunion:
            raise NotFoundException(
                message=f"Reunión con ID {reunion_id} no encontrada",
                details={"reunion_id": str(reunion_id)},
            )

        # Obtener bloque_id antes de eliminar
        bloque_id = reunion.bloque_id

        # Verificar si hay otras reuniones en el mismo bloque ANTES de eliminar
        otras_reuniones = self.reunion_repository.get_by_bloque(bloque_id)
        # Filtrar la reunión actual
        otras_reuniones_sin_actual = [r for r in otras_reuniones if r.id != reunion_id]

        # Eliminar reunión
        eliminado = self.reunion_repository.delete(reunion_id)

        # Liberar bloque si no hay otras reuniones en el mismo bloque
        if eliminado and len(otras_reuniones_sin_actual) == 0:
            bloque = self.bloque_repository.get_by_id(bloque_id)
            if bloque:
                self.bloque_repository.update(
                    bloque_id=bloque_id,
                    disponible=True
                )

        return {"success": eliminado, "message": "Reunión eliminada exitosamente"}
