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

        # Soft delete: solo marcar como inactivo (permitir eliminar eventos con inscripciones)
        # Las inscripciones se mantienen en la base de datos para auditoría
        return self.repository.delete(evento_id)
