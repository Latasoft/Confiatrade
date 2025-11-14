from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from core.entities.empresa import Empresa


class EmpresaRepository(ABC):
    @abstractmethod
    def create(self, empresa: Empresa) -> Empresa:
        pass

    @abstractmethod
    def get_by_id(self, empresa_id: UUID) -> Optional[Empresa]:
        pass

    @abstractmethod
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        pais_id: Optional[int] = None,
        sector_id: Optional[int] = None,
    ) -> List[Empresa]:
        pass

    @abstractmethod
    def update(self, empresa: Empresa) -> Empresa:
        pass

    @abstractmethod
    def delete(self, empresa_id: UUID) -> bool:
        pass

    @abstractmethod
    def count(self) -> int:
        pass
