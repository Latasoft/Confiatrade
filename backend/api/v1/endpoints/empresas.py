from typing import List, Optional
from uuid import UUID

from api.dependencies.auth import get_current_admin
from api.schemas.empresa import EmpresaCreate, EmpresaResponse, EmpresaUpdate
from api.v1.dependencies import (
    create_empresa_use_case,
    get_empresa_use_case,
    get_empresas_use_case,
)
from core.use_cases.empresas.create_empresa import CreateEmpresa
from core.use_cases.empresas.get_empresa import GetEmpresa
from core.use_cases.empresas.get_empresas import GetEmpresas
from database import get_db
from exceptions.custom_exceptions import EmpresaNotFoundError
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models.sqlalchemy.empresa import EmpresaModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import Session

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
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    pais_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    aprobada: Optional[bool] = None,
    use_case: GetEmpresas = Depends(get_empresas_use_case),
):
    empresas = use_case.execute(
        skip=skip, limit=limit, pais_id=pais_id, sector_id=sector_id, aprobada=aprobada
    )

    return empresas


@router.get("/{empresa_id}", response_model=EmpresaResponse)
def get_empresa(empresa_id: UUID, use_case: GetEmpresa = Depends(get_empresa_use_case)):
    try:
        empresa = use_case.execute(empresa_id)
        return empresa
    except EmpresaNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{empresa_id}", response_model=EmpresaResponse)
def update_empresa(
    empresa_id: UUID,
    empresa_data: EmpresaUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar datos de una empresa"""
    empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada"
        )

    # Actualizar solo los campos proporcionados
    if empresa_data.nombre is not None:
        empresa.nombre = empresa_data.nombre
    if empresa_data.descripcion is not None:
        empresa.descripcion = empresa_data.descripcion
    if empresa_data.telefono is not None:
        empresa.telefono = empresa_data.telefono
    if empresa_data.email is not None:
        empresa.email = empresa_data.email
    if empresa_data.direccion is not None:
        empresa.direccion = empresa_data.direccion

    db.commit()
    db.refresh(empresa)

    return empresa


@router.patch("/{empresa_id}/aprobar", response_model=EmpresaResponse)
def aprobar_empresa(
    empresa_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin),
):
    """Aprobar una empresa (solo admin)"""
    empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada"
        )

    empresa.aprobada = True
    db.commit()
    db.refresh(empresa)

    return empresa


@router.patch("/{empresa_id}/rechazar", response_model=EmpresaResponse)
def rechazar_empresa(
    empresa_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin),
):
    """Rechazar/Desaprobar una empresa (solo admin)"""
    empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada"
        )

    empresa.aprobada = False
    db.commit()
    db.refresh(empresa)

    return empresa
