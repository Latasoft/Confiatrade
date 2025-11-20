"""Use case: Actualizar un evento"""

from uuid import UUID

from api.schemas.evento import EventoUpdate
from core.exceptions import NotFoundException, ValidationException
from models.sqlalchemy.evento_model import EventoModel
from repositories.postgres.evento_repository import EventoRepository


class UpdateEventoUseCase:
    """Use case para actualizar un evento existente"""

    def __init__(self, repository: EventoRepository):
        self.repository = repository

    def execute(self, evento_id: UUID, update_data: EventoUpdate) -> EventoModel:
        """
        Actualizar evento

        Args:
            evento_id: UUID del evento a actualizar
            update_data: Datos a actualizar

        Returns:
            EventoModel: Evento actualizado

        Raises:
            NotFoundException: Si el evento no existe
            ValidationException: Si las fechas son inválidas
        """
        # Verificar que el evento existe
        evento = self.repository.get_by_id(evento_id)
        if not evento:
            raise NotFoundException(f"Evento con ID {evento_id} no encontrado")

        # Obtener datos a actualizar (solo los que no son None)
        update_dict = update_data.model_dump(exclude_unset=True)

        # Validar fechas si se están actualizando
        fecha_inicio = update_dict.get("fecha_inicio", evento.fecha_inicio)
        fecha_fin = update_dict.get("fecha_fin", evento.fecha_fin)

        if fecha_fin < fecha_inicio:
            raise ValidationException(
                "La fecha de fin debe ser posterior o igual a la fecha de inicio"
            )

        return self.repository.update(evento_id, update_dict)
