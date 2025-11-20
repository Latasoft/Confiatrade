"""Use case: Inscribir una empresa a un evento"""

from api.schemas.empresa_evento import EmpresaEventoCreate
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository
from repositories.postgres.empresa_repository import PostgresEmpresaRepository
from repositories.postgres.evento_repository import EventoRepository


class InscribirEmpresaUseCase:
    """Use case para inscribir una empresa a un evento"""

    def __init__(
        self,
        inscripcion_repository: EmpresaEventoRepository,
        empresa_repository: PostgresEmpresaRepository,
        evento_repository: EventoRepository,
    ):
        self.inscripcion_repository = inscripcion_repository
        self.empresa_repository = empresa_repository
        self.evento_repository = evento_repository

    def execute(self, inscripcion_data: EmpresaEventoCreate) -> EmpresaEventoModel:
        """
        Ejecutar inscripción de empresa a evento

        Args:
            inscripcion_data: Datos de la inscripción

        Returns:
            EmpresaEventoModel: Inscripción creada

        Raises:
            NotFoundException: Si la empresa o el evento no existen
            ValidationException: Si el evento no acepta inscripciones
            BusinessLogicException: Si ya existe la inscripción o se alcanzó la capacidad
        """
        # Verificar que la empresa existe
        empresa = self.empresa_repository.get_by_id(inscripcion_data.empresa_id)
        if not empresa:
            raise NotFoundException(
                f"Empresa con ID {inscripcion_data.empresa_id} no encontrada"
            )

        # Verificar que el evento existe y está activo
        evento = self.evento_repository.get_by_id(inscripcion_data.evento_id)
        if not evento:
            raise NotFoundException(
                f"Evento con ID {inscripcion_data.evento_id} no encontrado"
            )

        if not evento.activo:
            raise ValidationException("El evento no está activo")

        # Verificar que el evento acepta inscripciones
        if evento.estado not in ["planificacion", "inscripciones_abiertas"]:
            raise ValidationException(
                f"El evento está en estado '{evento.estado}' y no acepta inscripciones"
            )

        # Verificar que no existe una inscripción previa
        inscripcion_existente = self.inscripcion_repository.get_by_empresa_evento(
            inscripcion_data.empresa_id, inscripcion_data.evento_id
        )
        if inscripcion_existente:
            raise BusinessLogicException("La empresa ya está inscrita en este evento")

        # Verificar capacidad del evento
        if evento.capacidad_empresas:
            empresas_aprobadas = self.inscripcion_repository.count_aprobadas(evento.id)
            if empresas_aprobadas >= evento.capacidad_empresas:
                raise BusinessLogicException(
                    f"El evento ha alcanzado su capacidad máxima de {evento.capacidad_empresas} empresas"
                )

        # Crear inscripción
        inscripcion_dict = inscripcion_data.model_dump()
        inscripcion_dict["aprobada"] = False  # Por defecto pendiente

        return self.inscripcion_repository.create(inscripcion_dict)
