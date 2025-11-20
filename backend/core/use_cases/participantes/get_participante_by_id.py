"""Use case: Obtener Participante por ID"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.participante_repository import ParticipanteRepository


class GetParticipanteByIdUseCase:
    """Use case para obtener un participante por ID"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(self, participante_id: UUID):
        """Obtener participante por ID con validación"""
        participante = self.participante_repository.get_by_id(participante_id)

        if not participante:
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado",
                details={"participante_id": str(participante_id)},
            )

        return participante
