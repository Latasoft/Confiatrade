"""Use case: Obtener un participante de mi empresa por ID"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.participante_repository import ParticipanteRepository


class GetMiParticipanteByIdUseCase:
    """Use case para obtener un participante específico de la empresa"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(self, participante_id: UUID, empresa_id: UUID):
        """
        Obtener participante por ID validando que pertenezca a la empresa

        Args:
            participante_id: ID del participante
            empresa_id: ID de la empresa autenticada

        Returns:
            Participante si pertenece a la empresa

        Raises:
            NotFoundException: Si no existe o no pertenece a la empresa
        """
        participante = self.participante_repository.get_by_id(participante_id)

        if not participante:
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado",
                details={"participante_id": str(participante_id)},
            )

        # Validar que pertenezca a la empresa autenticada
        if participante.empresa_id != empresa_id:
            raise NotFoundException(
                message="Participante no encontrado en tu empresa",
                details={"participante_id": str(participante_id)},
            )

        return participante
