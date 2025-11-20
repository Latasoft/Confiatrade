from typing import List, Optional
from uuid import UUID

from core.entities.empresa import Empresa
from core.interfaces.repositories.empresa_repository import EmpresaRepository
from models.sqlalchemy.empresa import EmpresaModel
from sqlalchemy.orm import Session


class PostgresEmpresaRepository(EmpresaRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, empresa: Empresa) -> Empresa:
        db_empresa = EmpresaModel(
            id=empresa.id,
            nombre=empresa.nombre,
            pais_id=empresa.pais_id,
            sector_id=empresa.sector_id,
            descripcion=empresa.descripcion,
            sitio_web=empresa.sitio_web,
            telefono=empresa.telefono,
            email=empresa.email,
            direccion=empresa.direccion,
            logo_url=empresa.logo_url,
            aprobada=empresa.aprobada,
            fecha_registro=empresa.fecha_registro,
            updated_at=empresa.updated_at,
        )

        self.db.add(db_empresa)
        self.db.commit()
        self.db.refresh(db_empresa)

        return self._to_entity(db_empresa)

    def get_by_id(self, empresa_id: UUID) -> Optional[Empresa]:
        db_empresa = (
            self.db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()
        )

        return self._to_entity(db_empresa) if db_empresa else None

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        pais_id: Optional[int] = None,
        sector_id: Optional[int] = None,
        aprobada: Optional[bool] = None,
    ) -> List[Empresa]:
        query = self.db.query(EmpresaModel)

        if pais_id:
            query = query.filter(EmpresaModel.pais_id == pais_id)
        if sector_id:
            query = query.filter(EmpresaModel.sector_id == sector_id)
        if aprobada is not None:
            query = query.filter(EmpresaModel.aprobada == aprobada)

        db_empresas = query.offset(skip).limit(limit).all()

        return [self._to_entity(e) for e in db_empresas]

    def update(self, empresa: Empresa) -> Empresa:
        db_empresa = (
            self.db.query(EmpresaModel).filter(EmpresaModel.id == empresa.id).first()
        )

        if not db_empresa:
            return None

        for key, value in empresa.__dict__.items():
            if hasattr(db_empresa, key):
                setattr(db_empresa, key, value)

        self.db.commit()
        self.db.refresh(db_empresa)

        return self._to_entity(db_empresa)

    def delete(self, empresa_id: UUID) -> bool:
        db_empresa = (
            self.db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()
        )

        if not db_empresa:
            return False

        self.db.delete(db_empresa)
        self.db.commit()

        return True

    def count(self) -> int:
        return self.db.query(EmpresaModel).count()

    def _to_entity(self, model: EmpresaModel) -> Empresa:
        return Empresa(
            id=model.id,
            nombre=model.nombre,
            pais_id=model.pais_id,
            sector_id=model.sector_id,
            descripcion=model.descripcion,
            sitio_web=model.sitio_web,
            telefono=model.telefono,
            email=model.email,
            direccion=model.direccion,
            logo_url=model.logo_url,
            aprobada=model.aprobada,
            fecha_registro=model.fecha_registro,
            updated_at=model.updated_at,
        )
