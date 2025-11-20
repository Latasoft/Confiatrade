"""Use case: Actualizar Curaduría"""

from typing import Optional
from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.curaduria_repository import CuraduriaRepository


class ActualizarCuraduriaUseCase:
    """Use case para actualizar curaduría"""

    def __init__(self, curaduria_repository: CuraduriaRepository):
        self.curaduria_repository = curaduria_repository

    def execute(
        self,
        curaduria_id: UUID,
        ofrece: Optional[str] = None,
        busca: Optional[str] = None,
        objetivos: Optional[str] = None,
        capacidades: Optional[str] = None,
        notas_internas: Optional[str] = None,
    ):
        """Actualizar curaduría existente"""
        # 1. Validar que existe
        curaduria = self.curaduria_repository.get_by_id(curaduria_id)
        if not curaduria:
            raise NotFoundException(
                message=f"Curaduría con ID {curaduria_id} no encontrada",
                details={"curaduria_id": str(curaduria_id)},
            )

        # 2. Actualizar
        curaduria_actualizada = self.curaduria_repository.update(
            curaduria_id=curaduria_id,
            ofrece=ofrece,
            busca=busca,
            objetivos=objetivos,
            capacidades=capacidades,
            notas_internas=notas_internas,
        )

        return curaduria_actualizada
