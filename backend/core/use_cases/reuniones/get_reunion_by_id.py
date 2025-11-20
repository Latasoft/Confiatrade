"""Use case: Obtener Reunión por ID"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.reunion_repository import ReunionRepository


class GetReunionByIdUseCase:
    """Use case para obtener una reunión por ID"""

    def __init__(self, reunion_repository: ReunionRepository):
        self.reunion_repository = reunion_repository

    def execute(self, reunion_id: UUID):
        """Obtener reunión por ID con validación"""
        reunion = self.reunion_repository.get_by_id(reunion_id)

        if not reunion:
            raise NotFoundException(
                message=f"Reunión con ID {reunion_id} no encontrada",
                details={"reunion_id": str(reunion_id)},
            )

        return reunion
