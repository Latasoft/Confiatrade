from typing import List, Optional

from core.entities.empresa import Empresa
from core.interfaces.repositories.empresa_repository import EmpresaRepository


class GetEmpresas:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        pais_id: Optional[int] = None,
        sector_id: Optional[int] = None,
        aprobada: Optional[bool] = None,
    ) -> List[Empresa]:
        return self.repository.get_all(
            skip=skip,
            limit=limit,
            pais_id=pais_id,
            sector_id=sector_id,
            aprobada=aprobada,
        )
