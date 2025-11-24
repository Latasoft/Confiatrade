"""Repository para Curaduría"""

from typing import Optional
from uuid import UUID

from models.sqlalchemy import CuraduriaModel, EmpresaModel
from sqlalchemy.orm import Session, joinedload


class CuraduriaRepository:
    """Repository para gestión de curaduría"""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        empresa_id: UUID,
        ofrece: Optional[str] = None,
        busca: Optional[str] = None,
        objetivos: Optional[str] = None,
        capacidades: Optional[str] = None,
        notas_internas: Optional[str] = None,
    ) -> CuraduriaModel:
        """Crear una nueva curaduría"""
        curaduria = CuraduriaModel(
            empresa_id=empresa_id,
            ofrece=ofrece,
            busca=busca,
            objetivos=objetivos,
            capacidades=capacidades,
            notas_internas=notas_internas,
        )
        self.db.add(curaduria)
        self.db.commit()
        self.db.refresh(curaduria)
        return self.get_by_id(curaduria.id)

    def get_by_id(self, curaduria_id: UUID) -> Optional[CuraduriaModel]:
        """Obtener curaduría por ID con empresa cargada"""
        return (
            self.db.query(CuraduriaModel)
            .options(
                joinedload(CuraduriaModel.empresa).joinedload(EmpresaModel.sector),
                joinedload(CuraduriaModel.empresa).joinedload(EmpresaModel.pais),
            )
            .filter(CuraduriaModel.id == curaduria_id)
            .first()
        )

    def get_by_empresa_id(self, empresa_id: UUID) -> Optional[CuraduriaModel]:
        """Obtener curaduría por empresa_id"""
        return (
            self.db.query(CuraduriaModel)
            .options(
                joinedload(CuraduriaModel.empresa).joinedload(EmpresaModel.sector),
                joinedload(CuraduriaModel.empresa).joinedload(EmpresaModel.pais),
            )
            .filter(CuraduriaModel.empresa_id == empresa_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[CuraduriaModel]:
        """Obtener todas las curadurías"""
        return (
            self.db.query(CuraduriaModel)
            .options(
                joinedload(CuraduriaModel.empresa).joinedload(EmpresaModel.sector),
                joinedload(CuraduriaModel.empresa).joinedload(EmpresaModel.pais),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(
        self,
        curaduria_id: UUID,
        ofrece: Optional[str] = None,
        busca: Optional[str] = None,
        objetivos: Optional[str] = None,
        capacidades: Optional[str] = None,
        notas_internas: Optional[str] = None,
    ) -> Optional[CuraduriaModel]:
        """Actualizar curaduría"""
        curaduria = self.get_by_id(curaduria_id)
        if not curaduria:
            return None

        if ofrece is not None:
            curaduria.ofrece = ofrece
        if busca is not None:
            curaduria.busca = busca
        if objetivos is not None:
            curaduria.objetivos = objetivos
        if capacidades is not None:
            curaduria.capacidades = capacidades
        if notas_internas is not None:
            curaduria.notas_internas = notas_internas

        self.db.commit()
        self.db.refresh(curaduria)
        return curaduria

    def delete(self, curaduria_id: UUID) -> bool:
        """Eliminar curaduría (hard delete)"""
        curaduria = self.get_by_id(curaduria_id)
        if not curaduria:
            return False

        self.db.delete(curaduria)
        self.db.commit()
        return True

    def count_total(self) -> int:
        """Contar total de curadurías"""
        from sqlalchemy import func

        return self.db.query(func.count(CuraduriaModel.id)).scalar() or 0
