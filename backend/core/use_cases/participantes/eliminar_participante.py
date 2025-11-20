"""Use case: Eliminar Participante"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.participante_repository import ParticipanteRepository


class EliminarParticipanteUseCase:
    """Use case para eliminar participante"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(self, participante_id: UUID):
        """Eliminar participante con validación"""
        # Validar que existe
        participante = self.participante_repository.get_by_id(participante_id)
        if not participante:
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado",
                details={"participante_id": str(participante_id)},
            )

        # Eliminar
        eliminado = self.participante_repository.delete(participante_id)

        return {"success": eliminado, "message": "Participante eliminado exitosamente"}
