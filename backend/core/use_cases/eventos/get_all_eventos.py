"""Use case: Obtener todos los eventos"""

from typing import List, Optional

from models.sqlalchemy.evento_model import EventoModel
from repositories.postgres.evento_repository import EventoRepository


class GetAllEventosUseCase:
    """Use case para obtener todos los eventos con filtros"""

    def __init__(self, repository: EventoRepository):
        self.repository = repository

    def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        activo: Optional[bool] = None,
        estado: Optional[str] = None,
    ) -> List[EventoModel]:
        """
        Obtener lista de eventos con filtros opcionales

        Args:
            skip: Número de registros a saltar (paginación)
            limit: Límite de registros a retornar
            activo: Filtrar por eventos activos/inactivos
            estado: Filtrar por estado específico

        Returns:
            List[EventoModel]: Lista de eventos
        """
        return self.repository.get_all(
            skip=skip, limit=limit, activo=activo, estado=estado
        )

    def get_stats(self) -> dict:
        """
        Obtener estadísticas de eventos

        Returns:
            dict: Diccionario con total, activos y finalizados
        """
        return {
            "total": self.repository.count_total(),
            "activos": self.repository.count_activos(),
            "finalizados": self.repository.count_finalizados(),
        }
