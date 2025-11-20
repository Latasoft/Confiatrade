"""Use case: Cancelar inscripción de empresa"""

from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository


class CancelarInscripcionUseCase:
    """Use case para cancelar inscripción de empresa"""

    def __init__(self, repository: EmpresaEventoRepository):
        self.repository = repository

    def execute(self, inscripcion_id: UUID) -> bool:
        """
        Cancelar inscripción (eliminar registro)

        Args:
            inscripcion_id: UUID de la inscripción

        Returns:
            bool: True si se canceló correctamente

        Raises:
            NotFoundException: Si la inscripción no existe
        """
        # Verificar que la inscripción existe
        inscripcion = self.repository.get_by_id(inscripcion_id)
        if not inscripcion:
            raise NotFoundException(
                f"Inscripción con ID {inscripcion_id} no encontrada"
            )

        return self.repository.delete(inscripcion_id)
