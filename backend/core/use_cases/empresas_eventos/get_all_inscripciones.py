"""Use case: Obtener todas las inscripciones con filtros"""

from typing import List, Optional
from uuid import UUID

from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository


class GetAllInscripcionesUseCase:
    """Use case para obtener todas las inscripciones con filtros"""

    def __init__(self, repository: EmpresaEventoRepository):
        self.repository = repository

    def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        evento_id: Optional[UUID] = None,
        empresa_id: Optional[UUID] = None,
        aprobada: Optional[bool] = None,
    ) -> List[EmpresaEventoModel]:
        """
        Obtener lista de inscripciones con filtros opcionales

        Args:
            skip: Número de registros a saltar (paginación)
            limit: Límite de registros a retornar
            evento_id: Filtrar por evento específico
            empresa_id: Filtrar por empresa específica
            aprobada: Filtrar por estado de aprobación

        Returns:
            List[EmpresaEventoModel]: Lista de inscripciones
        """
        return self.repository.get_all(
            skip=skip,
            limit=limit,
            evento_id=evento_id,
            empresa_id=empresa_id,
            aprobada=aprobada,
        )

    def get_stats(
        self, evento_id: Optional[UUID] = None, empresa_id: Optional[UUID] = None
    ) -> dict:
        """
        Obtener estadísticas de inscripciones

        Args:
            evento_id: Filtrar por evento específico
            empresa_id: Filtrar por empresa específica

        Returns:
            dict: Diccionario con total, aprobadas y pendientes
        """
        return {
            "total": self.repository.count_total(evento_id),
            "aprobadas": self.repository.count_aprobadas(evento_id),
            "pendientes": self.repository.count_pendientes(evento_id),
        }
