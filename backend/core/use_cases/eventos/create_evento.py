"""Use case: Crear un nuevo evento"""

from datetime import date

from api.schemas.evento import EventoCreate
from core.exceptions import ValidationException
from models.sqlalchemy.evento_model import EventoModel
from repositories.postgres.evento_repository import EventoRepository


class CreateEventoUseCase:
    """Use case para crear un nuevo evento"""

    def __init__(self, repository: EventoRepository):
        self.repository = repository

    def execute(self, evento_data: EventoCreate) -> EventoModel:
        """
        Ejecutar creación de evento

        Args:
            evento_data: Datos del evento a crear

        Returns:
            EventoModel: Evento creado

        Raises:
            ValidationException: Si las fechas son inválidas
        """
        # Validar que fecha_fin >= fecha_inicio
        if evento_data.fecha_fin < evento_data.fecha_inicio:
            raise ValidationException(
                "La fecha de fin debe ser posterior o igual a la fecha de inicio"
            )

        # Validar que la fecha de inicio no sea en el pasado
        if evento_data.fecha_inicio < date.today():
            raise ValidationException("La fecha de inicio no puede ser en el pasado")

        # Crear evento con estado inicial
        evento_dict = evento_data.model_dump()

        # Mapear ubicacion a ciudad_sede si viene ubicacion
        if "ubicacion" in evento_dict:
            evento_dict["ciudad_sede"] = evento_dict.pop("ubicacion")

        # Asegurar estado y tipo por defecto
        if "estado" not in evento_dict or not evento_dict["estado"]:
            evento_dict["estado"] = "planificacion"
        if "tipo" not in evento_dict:
            evento_dict["tipo"] = "encuentro_empresarial"
        evento_dict["activo"] = True

        return self.repository.create(evento_dict)
