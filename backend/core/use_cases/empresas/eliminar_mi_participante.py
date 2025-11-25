"""Use case: Eliminar participante de mi empresa"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.participante_repository import ParticipanteRepository


class EliminarMiParticipanteUseCase:
    """Use case para eliminar participante de la empresa autenticada"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(self, participante_id: UUID, empresa_id: UUID):
        """
        Eliminar participante validando que pertenezca a la empresa

        Args:
            participante_id: ID del participante a eliminar
            empresa_id: ID de la empresa autenticada

        Returns:
            True si se eliminó correctamente

        Raises:
            NotFoundException: Si no existe o no pertenece a la empresa
        """
        # Verificar que existe y pertenece a la empresa
        participante = self.participante_repository.get_by_id(participante_id)
        if not participante:
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado",
                details={"participante_id": str(participante_id)},
            )

        if participante.empresa_id != empresa_id:
            raise NotFoundException(
                message="Participante no encontrado en tu empresa",
                details={"participante_id": str(participante_id)},
            )

        # Eliminar participante
        return self.participante_repository.delete(participante_id)
