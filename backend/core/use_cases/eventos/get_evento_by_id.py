"""Use case: Obtener un evento por ID"""

from uuid import UUID

from core.exceptions import NotFoundException
from models.sqlalchemy.evento_model import EventoModel
from repositories.postgres.evento_repository import EventoRepository


class GetEventoByIdUseCase:
    """Use case para obtener un evento específico por ID"""

    def __init__(self, repository: EventoRepository):
        self.repository = repository

    def execute(self, evento_id: UUID) -> EventoModel:
        """
        Obtener evento por ID

        Args:
            evento_id: UUID del evento

        Returns:
            EventoModel: Evento encontrado

        Raises:
            NotFoundException: Si el evento no existe
        """
        evento = self.repository.get_by_id(evento_id)

        if not evento:
            raise NotFoundException(f"Evento con ID {evento_id} no encontrado")

        return evento
