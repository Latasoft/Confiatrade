"""Use case: Obtener Curaduría por ID"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.curaduria_repository import CuraduriaRepository


class ObtenerCuraduriaUseCase:
    """Use case para obtener curaduría por ID"""

    def __init__(self, curaduria_repository: CuraduriaRepository):
        self.curaduria_repository = curaduria_repository

    def execute(self, curaduria_id: UUID):
        """Obtener curaduría por ID con datos de empresa"""
        curaduria = self.curaduria_repository.get_by_id(curaduria_id)
        if not curaduria:
            raise NotFoundException(
                message=f"Curaduría con ID {curaduria_id} no encontrada",
                details={"curaduria_id": str(curaduria_id)},
            )
        return curaduria
