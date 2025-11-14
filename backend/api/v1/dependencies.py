from core.use_cases.empresas.create_empresa import CreateEmpresa
from core.use_cases.empresas.get_empresa import GetEmpresa
from core.use_cases.empresas.get_empresas import GetEmpresas
from database import get_db
from fastapi import Depends
from repositories.postgres.empresa_repository import PostgresEmpresaRepository
from sqlalchemy.orm import Session


def get_empresa_repository(db: Session = Depends(get_db)) -> PostgresEmpresaRepository:
    return PostgresEmpresaRepository(db)


def get_empresas_use_case(
    repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> GetEmpresas:
    return GetEmpresas(repository)


def get_empresa_use_case(
    repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> GetEmpresa:
    return GetEmpresa(repository)


def create_empresa_use_case(
    repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> CreateEmpresa:
    return CreateEmpresa(repository)
