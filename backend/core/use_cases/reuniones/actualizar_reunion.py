"""Use case: Actualizar Reunión"""

from typing import Optional
from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.reunion_repository import ReunionRepository


class ActualizarReunionUseCase:
    """Use case para actualizar reunión"""

    def __init__(self, reunion_repository: ReunionRepository):
        self.reunion_repository = reunion_repository

    def execute(
        self,
        reunion_id: UUID,
        estado: Optional[str] = None,
        notas: Optional[str] = None,
        requiere_interprete: Optional[bool] = None,
        sala: Optional[str] = None,
        resultado: Optional[str] = None,
    ):
        """
        Actualizar reunión con validación:
        - Reunión debe existir
        - No se permite cambiar empresas o bloque
        """
        # Validar que reunión existe
        reunion = self.reunion_repository.get_by_id(reunion_id)
        if not reunion:
            raise NotFoundException(
                message=f"Reunión con ID {reunion_id} no encontrada",
                details={"reunion_id": str(reunion_id)},
            )

        # Actualizar
        reunion_actualizada = self.reunion_repository.update(
            reunion_id=reunion_id,
            estado=estado,
            notas=notas,
            requiere_interprete=requiere_interprete,
            sala=sala,
            resultado=resultado,
        )

        return reunion_actualizada
