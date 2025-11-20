"""Use case: Eliminar Curaduría"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.curaduria_repository import CuraduriaRepository


class EliminarCuraduriaUseCase:
    """Use case para eliminar curaduría"""

    def __init__(self, curaduria_repository: CuraduriaRepository):
        self.curaduria_repository = curaduria_repository

    def execute(self, curaduria_id: UUID):
        """Eliminar curaduría (hard delete)"""
        # 1. Validar que existe
        curaduria = self.curaduria_repository.get_by_id(curaduria_id)
        if not curaduria:
            raise NotFoundException(
                message=f"Curaduría con ID {curaduria_id} no encontrada",
                details={"curaduria_id": str(curaduria_id)},
            )

        # 2. Eliminar
        self.curaduria_repository.delete(curaduria_id)
