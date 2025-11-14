from uuid import UUID

from core.entities.empresa import Empresa
from core.interfaces.repositories.empresa_repository import EmpresaRepository
from exceptions.custom_exceptions import EmpresaNotFoundError


class GetEmpresa:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(self, empresa_id: UUID) -> Empresa:
        empresa = self.repository.get_by_id(empresa_id)

        if not empresa:
            raise EmpresaNotFoundError(f"Empresa with id {empresa_id} not found")

        return empresa
