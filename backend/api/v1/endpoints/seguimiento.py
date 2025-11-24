"""Endpoints para Seguimiento"""

from typing import Optional
from uuid import UUID

from api.schemas.seguimiento import (
    SeguimientoCreate,
    SeguimientoDetailResponse,
    SeguimientoListResponse,
    SeguimientoResponse,
    SeguimientoUpdate,
)
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from repositories.postgres.seguimiento_repository import SeguimientoRepository
from sqlalchemy.orm import Session

router = APIRouter()


def get_seguimiento_repository(db: Session = Depends(get_db)) -> SeguimientoRepository:
    """Dependency para obtener repository de seguimiento"""
    return SeguimientoRepository(db)


@router.post(
    "/",
    response_model=SeguimientoDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear seguimiento",
    description="Crear un nuevo seguimiento para una empresa",
)
async def crear_seguimiento(
    seguimiento_data: SeguimientoCreate,
    repo: SeguimientoRepository = Depends(get_seguimiento_repository),
):
    """Crear seguimiento con validaciones"""
    try:
        seguimiento = repo.create(seguimiento_data.model_dump())
        seg_dict = {
            "id": seguimiento.id,
            "empresa_id": seguimiento.empresa_id,
            "tipo": seguimiento.tipo,
            "descripcion": seguimiento.descripcion,
            "estado": seguimiento.estado,
            "responsable": seguimiento.responsable,
            "fecha_compromiso": seguimiento.fecha_compromiso,
            "resultado": seguimiento.resultado,
            "monto_estimado": seguimiento.monto_estimado,
            "notas": seguimiento.notas,
            "created_at": seguimiento.created_at,
            "updated_at": seguimiento.updated_at,
            "empresa_nombre": seguimiento.empresa.nombre if seguimiento.empresa else None,
            "empresa_pais": seguimiento.empresa.pais.nombre
            if seguimiento.empresa and seguimiento.empresa.pais
            else None,
            "empresa_sector": seguimiento.empresa.sector.nombre
            if seguimiento.empresa and seguimiento.empresa.sector
            else None,
        }
        return SeguimientoDetailResponse(**seg_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al crear seguimiento: {str(e)}",
        )


@router.get(
    "/",
    response_model=SeguimientoListResponse,
    summary="Listar seguimientos",
    description="Obtener lista de seguimientos con filtros opcionales",
)
async def listar_seguimientos(
    repo: SeguimientoRepository = Depends(get_seguimiento_repository),
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    empresa_id: Optional[UUID] = Query(None, description="Filtrar por empresa"),
    tipo: Optional[str] = Query(
        None, description="Filtrar por tipo (acuerdo, loi, seguimiento)"
    ),
    estado: Optional[str] = Query(
        None,
        description="Filtrar por estado (pendiente, en_proceso, completado, cancelado)",
    ),
):
    """Listar seguimientos con paginación y filtros"""
    seguimientos = repo.get_all(
        skip=skip, limit=limit, empresa_id=empresa_id, tipo=tipo, estado=estado
    )
    total = repo.count(empresa_id=empresa_id, tipo=tipo, estado=estado)

    # Convertir a response con datos de empresa
    seguimientos_response = []
    for seg in seguimientos:
        seg_dict = {
            "id": seg.id,
            "empresa_id": seg.empresa_id,
            "tipo": seg.tipo,
            "descripcion": seg.descripcion,
            "estado": seg.estado,
            "responsable": seg.responsable,
            "fecha_compromiso": seg.fecha_compromiso,
            "notas": seg.notas,
            "created_at": seg.created_at,
            "updated_at": seg.updated_at,
            "empresa_nombre": seg.empresa.nombre if seg.empresa else None,
            "empresa_pais": seg.empresa.pais.nombre
            if seg.empresa and seg.empresa.pais
            else None,
            "empresa_sector": seg.empresa.sector.nombre
            if seg.empresa and seg.empresa.sector
            else None,
        }
        seguimientos_response.append(SeguimientoDetailResponse(**seg_dict))

    return SeguimientoListResponse(seguimientos=seguimientos_response, total=total)


@router.get(
    "/{seguimiento_id}",
    response_model=SeguimientoDetailResponse,
    summary="Obtener seguimiento por ID",
    description="Obtener detalles de un seguimiento específico",
)
async def obtener_seguimiento(
    seguimiento_id: UUID,
    repo: SeguimientoRepository = Depends(get_seguimiento_repository),
):
    """Obtener seguimiento por ID con datos de empresa"""
    seguimiento = repo.get_by_id(seguimiento_id)
    if not seguimiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seguimiento no encontrado",
        )

    seg_dict = {
        "id": seguimiento.id,
        "empresa_id": seguimiento.empresa_id,
        "tipo": seguimiento.tipo,
        "descripcion": seguimiento.descripcion,
        "estado": seguimiento.estado,
        "responsable": seguimiento.responsable,
        "fecha_compromiso": seguimiento.fecha_compromiso,
        "notas": seguimiento.notas,
        "created_at": seguimiento.created_at,
        "updated_at": seguimiento.updated_at,
        "empresa_nombre": seguimiento.empresa.nombre if seguimiento.empresa else None,
        "empresa_pais": seguimiento.empresa.pais.nombre
        if seguimiento.empresa and seguimiento.empresa.pais
        else None,
        "empresa_sector": seguimiento.empresa.sector.nombre
        if seguimiento.empresa and seguimiento.empresa.sector
        else None,
    }
    return SeguimientoDetailResponse(**seg_dict)


@router.patch(
    "/{seguimiento_id}",
    response_model=SeguimientoDetailResponse,
    summary="Actualizar seguimiento",
    description="Actualizar campos de un seguimiento existente",
)
async def actualizar_seguimiento(
    seguimiento_id: UUID,
    update_data: SeguimientoUpdate,
    repo: SeguimientoRepository = Depends(get_seguimiento_repository),
):
    """Actualizar seguimiento (actualización parcial)"""
    seguimiento = repo.update(seguimiento_id, update_data.model_dump(exclude_none=True))
    if not seguimiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seguimiento no encontrado",
        )
    seg_dict = {
        "id": seguimiento.id,
        "empresa_id": seguimiento.empresa_id,
        "tipo": seguimiento.tipo,
        "descripcion": seguimiento.descripcion,
        "estado": seguimiento.estado,
        "responsable": seguimiento.responsable,
        "fecha_compromiso": seguimiento.fecha_compromiso,
        "resultado": seguimiento.resultado,
        "monto_estimado": seguimiento.monto_estimado,
        "notas": seguimiento.notas,
        "created_at": seguimiento.created_at,
        "updated_at": seguimiento.updated_at,
        "empresa_nombre": seguimiento.empresa.nombre if seguimiento.empresa else None,
        "empresa_pais": seguimiento.empresa.pais.nombre
        if seguimiento.empresa and seguimiento.empresa.pais
        else None,
        "empresa_sector": seguimiento.empresa.sector.nombre
        if seguimiento.empresa and seguimiento.empresa.sector
        else None,
    }
    return SeguimientoDetailResponse(**seg_dict)


@router.delete(
    "/{seguimiento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar seguimiento",
    description="Eliminar un seguimiento por ID",
)
async def eliminar_seguimiento(
    seguimiento_id: UUID,
    repo: SeguimientoRepository = Depends(get_seguimiento_repository),
):
    """Eliminar seguimiento"""
    deleted = repo.delete(seguimiento_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seguimiento no encontrado",
        )
