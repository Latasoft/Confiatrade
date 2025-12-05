import os
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from api.dependencies.auth import get_current_admin, get_current_user
from api.schemas.empresa import EmpresaCreate, EmpresaResponse, EmpresaUpdate
from api.v1.dependencies import (
    create_empresa_use_case,
    get_empresa_use_case,
    get_empresas_use_case,
)
from config import settings
from core.use_cases.empresas.create_empresa import CreateEmpresa
from core.use_cases.empresas.get_empresa import GetEmpresa
from core.use_cases.empresas.get_empresas import GetEmpresas
from database import get_db
from exceptions.custom_exceptions import EmpresaNotFoundError
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from models.sqlalchemy.empresa import EmpresaModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import Session, joinedload

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
    evento_id: Optional[UUID] = None,
    use_case: GetEmpresas = Depends(get_empresas_use_case),
):
    empresas = use_case.execute(
        skip=skip,
        limit=limit,
        pais_id=pais_id,
        sector_id=sector_id,
        aprobada=aprobada,
        evento_id=evento_id,
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
    if empresa_data.sitio_web is not None:
        empresa.sitio_web = empresa_data.sitio_web
    if empresa_data.direccion is not None:
        empresa.direccion = empresa_data.direccion
    if empresa_data.presentacion_url is not None:
        empresa.presentacion_url = empresa_data.presentacion_url

    empresa.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(empresa)

    # Recargar con relaciones para serializar pais_nombre y sector_nombre
    empresa = (
        db.query(EmpresaModel)
        .options(joinedload(EmpresaModel.pais), joinedload(EmpresaModel.sector))
        .filter(EmpresaModel.id == empresa_id)
        .first()
    )

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

    # Recargar con relaciones para serializar pais_nombre y sector_nombre
    empresa = (
        db.query(EmpresaModel)
        .options(joinedload(EmpresaModel.pais), joinedload(EmpresaModel.sector))
        .filter(EmpresaModel.id == empresa_id)
        .first()
    )

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

    # Recargar con relaciones para serializar pais_nombre y sector_nombre
    empresa = (
        db.query(EmpresaModel)
        .options(joinedload(EmpresaModel.pais), joinedload(EmpresaModel.sector))
        .filter(EmpresaModel.id == empresa_id)
        .first()
    )

    return empresa


@router.post("/{empresa_id}/presentacion", response_model=EmpresaResponse)
async def upload_presentacion(
    empresa_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """Subir PDF de presentación de empresa"""

    # Verificar que la empresa existe
    empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada"
        )

    # Verificar permisos: solo admin o la empresa dueña
    if current_user.rol != "admin":
        if not current_user.empresa or str(current_user.empresa.id) != str(empresa_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para subir presentación de esta empresa",
            )

    # Validar tipo de archivo
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos PDF",
        )

    # Validar tamaño (5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no debe superar los 5MB",
        )

    # Crear directorio de almacenamiento si no existe
    upload_dir = "uploads/presentaciones"
    os.makedirs(upload_dir, exist_ok=True)

    # Generar nombre único para el archivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"presentacion_{empresa_id}_{timestamp}.pdf"
    file_path = os.path.join(upload_dir, filename)

    # Guardar archivo
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el archivo: {str(e)}",
        )

    # Actualizar URL en la base de datos con URL completa del backend
    # Usar barras normales para la URL (funciona en todos los sistemas)
    relative_path = file_path.replace("\\", "/")
    empresa.presentacion_url = f"{settings.BACKEND_URL}/{relative_path}"
    empresa.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(empresa)
    except Exception as e:
        # Si falla el commit, eliminar el archivo
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la base de datos: {str(e)}",
        )

    # Recargar con relaciones para serializar pais_nombre y sector_nombre
    empresa = (
        db.query(EmpresaModel)
        .options(joinedload(EmpresaModel.pais), joinedload(EmpresaModel.sector))
        .filter(EmpresaModel.id == empresa_id)
        .first()
    )

    # Retornar la empresa completa actualizada (FastAPI la serializará automáticamente)
    return empresa
