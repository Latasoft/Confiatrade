"""Use case: Aprobar o rechazar inscripción de empresa"""

from uuid import UUID

from api.schemas.empresa_evento import EmpresaEventoUpdate
from core.exceptions import NotFoundException
from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository


class AprobarInscripcionUseCase:
    """Use case para aprobar o rechazar inscripción de empresa"""

    def __init__(self, repository: EmpresaEventoRepository):
        self.repository = repository

    def execute(
        self, inscripcion_id: UUID, update_data: EmpresaEventoUpdate
    ) -> EmpresaEventoModel:
        """
        Ejecutar aprobación/rechazo de inscripción

        Args:
            inscripcion_id: UUID de la inscripción
            update_data: Datos de actualización (aprobada: bool)

        Returns:
            EmpresaEventoModel: Inscripción actualizada

        Raises:
            NotFoundException: Si la inscripción no existe
        """
        # Verificar que la inscripción existe
        inscripcion = self.repository.get_by_id(inscripcion_id)
        if not inscripcion:
            raise NotFoundException(
                f"Inscripción con ID {inscripcion_id} no encontrada"
            )

        # Actualizar estado de aprobación
        update_dict = update_data.model_dump()
        return self.repository.update(inscripcion_id, update_dict)
