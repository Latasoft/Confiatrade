"""Use case: Listar empresas inscritas en un evento"""

from typing import List, Optional
from uuid import UUID

from core.exceptions import NotFoundException
from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository
from repositories.postgres.evento_repository import EventoRepository


class ListarEmpresasPorEventoUseCase:
    """Use case para listar empresas inscritas en un evento"""

    def __init__(
        self,
        inscripcion_repository: EmpresaEventoRepository,
        evento_repository: EventoRepository,
    ):
        self.inscripcion_repository = inscripcion_repository
        self.evento_repository = evento_repository

    def execute(
        self, evento_id: UUID, aprobada: Optional[bool] = None
    ) -> List[EmpresaEventoModel]:
        """
        Ejecutar listado de empresas por evento

        Args:
            evento_id: UUID del evento
            aprobada: Filtrar por estado de aprobación (None = todas)

        Returns:
            List[EmpresaEventoModel]: Lista de inscripciones

        Raises:
            NotFoundException: Si el evento no existe
        """
        # Verificar que el evento existe
        evento = self.evento_repository.get_by_id(evento_id)
        if not evento:
            raise NotFoundException(f"Evento con ID {evento_id} no encontrado")

        return self.inscripcion_repository.get_empresas_by_evento(evento_id, aprobada)

    def get_stats(self, evento_id: UUID) -> dict:
        """
        Obtener estadísticas de inscripciones del evento

        Args:
            evento_id: UUID del evento

        Returns:
            dict: Diccionario con total, aprobadas y pendientes
        """
        return {
            "total": self.inscripcion_repository.count_total(evento_id),
            "aprobadas": self.inscripcion_repository.count_aprobadas(evento_id),
            "pendientes": self.inscripcion_repository.count_pendientes(evento_id),
        }
