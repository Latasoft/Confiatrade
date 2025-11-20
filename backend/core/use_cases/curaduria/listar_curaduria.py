"""Use case: Listar Curadurías"""

from repositories.postgres.curaduria_repository import CuraduriaRepository


class ListarCuraduriasUseCase:
    """Use case para listar todas las curadurías"""

    def __init__(self, curaduria_repository: CuraduriaRepository):
        self.curaduria_repository = curaduria_repository

    def execute(self, skip: int = 0, limit: int = 100):
        """Listar curadurías con paginación"""
        curaduria_list = self.curaduria_repository.get_all(skip=skip, limit=limit)
        total = self.curaduria_repository.count_total()
        return {"curaduria": curaduria_list, "total": total}
