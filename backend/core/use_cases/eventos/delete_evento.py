"""Use case: Eliminar un evento (soft delete)"""

from uuid import UUID

from core.exceptions import BusinessLogicException, NotFoundException
from repositories.postgres.evento_repository import EventoRepository


class DeleteEventoUseCase:
    """Use case para eliminar (soft delete) un evento"""

    def __init__(self, repository: EventoRepository):
        self.repository = repository

    def execute(self, evento_id: UUID) -> bool:
        """
        Eliminar evento (marca como inactivo)

        Args:
            evento_id: UUID del evento a eliminar

        Returns:
            bool: True si se eliminó correctamente

        Raises:
            NotFoundException: Si el evento no existe
            BusinessLogicException: Si el evento tiene empresas inscritas
        """
        # Verificar que el evento existe
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            raise NotFoundException(f"Evento con ID {evento_id} no encontrado")

        # Validar que no tenga empresas inscritas
        empresas_count = len(evento.empresas) if evento.empresas else 0
        if empresas_count > 0:
            raise BusinessLogicException(
                f"No se puede eliminar el evento porque tiene {empresas_count} empresas inscritas"
            )

        return self.repository.delete(evento_id)
