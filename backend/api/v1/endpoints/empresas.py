from typing import List, Optional
from uuid import UUID

from api.schemas.empresa import EmpresaCreate, EmpresaResponse
from api.v1.dependencies import (
    create_empresa_use_case,
    get_empresa_use_case,
    get_empresas_use_case,
)
from core.use_cases.empresas.create_empresa import CreateEmpresa
from core.use_cases.empresas.get_empresa import GetEmpresa
from core.use_cases.empresas.get_empresas import GetEmpresas
from exceptions.custom_exceptions import EmpresaNotFoundError
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
def create_empresa(
    empresa: EmpresaCreate, use_case: CreateEmpresa = Depends(create_empresa_use_case)
):
    empresa_entity = use_case.execute(
        nombre=empresa.nombre,
        pais_id=empresa.pais_id,
        sector_id=empresa.sector_id,
        descripcion=empresa.descripcion,
        sitio_web=empresa.sitio_web,
        telefono=empresa.telefono,
        email=empresa.email,
        direccion=empresa.direccion,
    )

    return empresa_entity


@router.get("/", response_model=List[EmpresaResponse])
def list_empresas(
    skip: int = 0,
    limit: int = 100,
    pais_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    use_case: GetEmpresas = Depends(get_empresas_use_case),
):
    empresas = use_case.execute(
        skip=skip, limit=limit, pais_id=pais_id, sector_id=sector_id
    )

    return empresas


@router.get("/{empresa_id}", response_model=EmpresaResponse)
def get_empresa(empresa_id: UUID, use_case: GetEmpresa = Depends(get_empresa_use_case)):
    try:
        empresa = use_case.execute(empresa_id)
        return empresa
    except EmpresaNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
