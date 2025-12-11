"""
Endpoints para gestión de roles y permisos
"""

import logging
from typing import List, Optional
from uuid import UUID

from api.dependencies.auth import get_current_admin_user
from api.schemas.roles_permisos import (
    AsignarPermisosRequest,
    PermisoCreate,
    PermisoListResponse,
    PermisoResponse,
    PermisosPorModuloResponse,
    PermisoUpdate,
    RemoverPermisosRequest,
    RolCreate,
    RolListResponse,
    RolResponse,
    RolUpdate,
)
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models.sqlalchemy.permiso_model import PermisoModel
from models.sqlalchemy.rol_model import RolModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

router = APIRouter()
logger = logging.getLogger(__name__)


# ============================================
# ENDPOINTS DE PERMISOS (DEBEN IR PRIMERO)
# ============================================


@router.get("/permisos/por-modulo", response_model=List[PermisosPorModuloResponse])
async def listar_permisos_por_modulo(
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Listar permisos agrupados por módulo
    Solo accesible por administradores
    """
    permisos = (
        db.query(PermisoModel)
        .filter(PermisoModel.activo)
        .order_by(PermisoModel.modulo, PermisoModel.nombre)
        .all()
    )

    # Agrupar por módulo
    permisos_por_modulo = {}
    for permiso in permisos:
        if permiso.modulo not in permisos_por_modulo:
            permisos_por_modulo[permiso.modulo] = []
        permisos_por_modulo[permiso.modulo].append(permiso)

    # Convertir a lista de respuestas
    resultado = [
        {"modulo": modulo, "permisos": permisos}
        for modulo, permisos in permisos_por_modulo.items()
    ]

    return resultado


@router.get("/permisos/{permiso_id}", response_model=PermisoResponse)
async def obtener_permiso(
    permiso_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Obtener detalles de un permiso específico
    Solo accesible por administradores
    """
    permiso = db.query(PermisoModel).filter(PermisoModel.id == permiso_id).first()

    if not permiso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Permiso con ID {permiso_id} no encontrado",
        )

    return permiso


@router.get("/permisos", response_model=PermisoListResponse)
async def listar_permisos(
    modulo: Optional[str] = Query(None, description="Filtrar por módulo"),
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Listar todos los permisos del sistema
    Solo accesible por administradores
    """
    logger.info(
        f"[PERMISOS] Iniciando listar_permisos - modulo={modulo}, activo={activo}"
    )
    logger.info(
        f"[PERMISOS] Usuario actual: {current_user.email}, rol={current_user.rol}, rol_id={current_user.rol_id}"
    )

    try:
        query = db.query(PermisoModel)

        if modulo:
            query = query.filter(PermisoModel.modulo == modulo)

        if activo is not None:
            query = query.filter(PermisoModel.activo == activo)

        permisos = query.order_by(PermisoModel.modulo, PermisoModel.nombre).all()
        logger.info(f"[PERMISOS] Encontrados {len(permisos)} permisos")

        return {"total": len(permisos), "permisos": permisos}
    except Exception as e:
        logger.error(f"[PERMISOS] Error al listar permisos: {str(e)}", exc_info=True)
        raise


@router.post(
    "/permisos", response_model=PermisoResponse, status_code=status.HTTP_201_CREATED
)
async def crear_permiso(
    permiso_data: PermisoCreate,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Crear un nuevo permiso
    Solo accesible por administradores
    """
    # Verificar que no exista un permiso con ese nombre
    permiso_existente = (
        db.query(PermisoModel)
        .filter(PermisoModel.nombre == permiso_data.nombre)
        .first()
    )
    if permiso_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un permiso con el nombre '{permiso_data.nombre}'",
        )

    # Crear el permiso
    nuevo_permiso = PermisoModel(
        nombre=permiso_data.nombre,
        descripcion=permiso_data.descripcion,
        modulo=permiso_data.modulo,
        accion=permiso_data.accion,
        recurso=permiso_data.recurso,
        activo=permiso_data.activo,
    )

    db.add(nuevo_permiso)
    db.commit()
    db.refresh(nuevo_permiso)

    return nuevo_permiso


@router.put("/permisos/{permiso_id}", response_model=PermisoResponse)
async def actualizar_permiso(
    permiso_id: UUID,
    permiso_data: PermisoUpdate,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Actualizar un permiso existente
    Solo accesible por administradores
    """
    permiso = db.query(PermisoModel).filter(PermisoModel.id == permiso_id).first()

    if not permiso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Permiso con ID {permiso_id} no encontrado",
        )

    # Actualizar campos
    if permiso_data.descripcion is not None:
        permiso.descripcion = permiso_data.descripcion
    if permiso_data.activo is not None:
        permiso.activo = permiso_data.activo

    db.commit()
    db.refresh(permiso)

    return permiso


# ============================================
# ENDPOINTS DE ROLES
# ============================================


@router.get("", response_model=RolListResponse)
async def listar_roles(
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Listar todos los roles del sistema
    Solo accesible por administradores
    """
    query = db.query(RolModel).options(joinedload(RolModel.permisos))

    if activo is not None:
        query = query.filter(RolModel.activo == activo)

    roles = query.order_by(RolModel.nombre).all()

    return {"total": len(roles), "roles": roles}


@router.post("", response_model=RolResponse, status_code=status.HTTP_201_CREATED)
async def crear_rol(
    rol_data: RolCreate,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Crear un nuevo rol
    Solo accesible por administradores
    """
    # Verificar que no exista un rol con ese nombre
    rol_existente = (
        db.query(RolModel).filter(RolModel.nombre == rol_data.nombre).first()
    )
    if rol_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un rol con el nombre '{rol_data.nombre}'",
        )

    # Verificar que los permisos existan
    if rol_data.permisos_ids:
        permisos = (
            db.query(PermisoModel)
            .filter(PermisoModel.id.in_(rol_data.permisos_ids))
            .all()
        )
        if len(permisos) != len(rol_data.permisos_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Algunos permisos especificados no existen",
            )
    else:
        permisos = []

    # Crear el rol
    nuevo_rol = RolModel(
        nombre=rol_data.nombre,
        descripcion=rol_data.descripcion,
        activo=rol_data.activo,
        es_sistema=False,  # Los roles creados por UI no son del sistema
    )

    # Asignar permisos
    nuevo_rol.permisos = permisos

    db.add(nuevo_rol)
    db.commit()
    db.refresh(nuevo_rol)

    return nuevo_rol


@router.get("/{rol_id}", response_model=RolResponse)
async def obtener_rol(
    rol_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Obtener detalles de un rol específico incluyendo sus permisos
    Solo accesible por administradores
    """
    rol = (
        db.query(RolModel)
        .options(joinedload(RolModel.permisos))
        .filter(RolModel.id == rol_id)
        .first()
    )

    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {rol_id} no encontrado",
        )

    return rol


@router.put("/{rol_id}", response_model=RolResponse)
async def actualizar_rol(
    rol_id: UUID,
    rol_data: RolUpdate,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Actualizar un rol existente
    Solo accesible por administradores
    No se pueden modificar roles del sistema
    """
    try:
        rol = db.query(RolModel).filter(RolModel.id == rol_id).first()

        if not rol:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rol con ID {rol_id} no encontrado",
            )

        # No permitir modificar roles del sistema
        if rol.es_sistema:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No se pueden modificar roles del sistema",
            )

        # Verificar nombre único si se está cambiando
        if rol_data.nombre and rol_data.nombre != rol.nombre:
            rol_existente = (
                db.query(RolModel).filter(RolModel.nombre == rol_data.nombre).first()
            )
            if rol_existente:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe un rol con el nombre '{rol_data.nombre}'",
                )

        # Actualizar campos
        if rol_data.nombre is not None:
            rol.nombre = rol_data.nombre
        if rol_data.descripcion is not None:
            rol.descripcion = rol_data.descripcion
        if rol_data.activo is not None:
            rol.activo = rol_data.activo

        # Actualizar permisos si se especifican
        if rol_data.permisos_ids is not None:
            permisos = (
                db.query(PermisoModel)
                .filter(PermisoModel.id.in_(rol_data.permisos_ids))
                .all()
            )
            if len(permisos) != len(rol_data.permisos_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Algunos permisos especificados no existen",
                )
            rol.permisos = permisos

        db.commit()
        db.refresh(rol)

        return rol

    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error actualizando rol {rol_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el rol. Por favor intente nuevamente.",
        )


@router.get("/{rol_id}/puede-eliminar")
async def verificar_puede_eliminar_rol(
    rol_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Verificar si un rol puede ser eliminado
    Retorna información sobre si el rol puede eliminarse y el motivo si no puede
    """
    rol = db.query(RolModel).filter(RolModel.id == rol_id).first()

    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {rol_id} no encontrado",
        )

    # Verificar si es rol del sistema
    if rol.es_sistema:
        return {
            "puede_eliminar": False,
            "motivo": "No se pueden eliminar roles del sistema",
            "usuarios_asignados": 0,
        }

    # Verificar si hay usuarios con este rol
    usuarios_count = (
        db.query(func.count(UsuarioModel.id))
        .filter(UsuarioModel.rol_id == rol_id)
        .scalar()
    )

    if usuarios_count > 0:
        return {
            "puede_eliminar": False,
            "motivo": f"El rol tiene {usuarios_count} usuario(s) asignado(s)",
            "usuarios_asignados": usuarios_count,
        }

    return {
        "puede_eliminar": True,
        "motivo": None,
        "usuarios_asignados": 0,
    }


@router.delete("/{rol_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_rol(
    rol_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Eliminar un rol
    Solo accesible por administradores
    No se pueden eliminar roles del sistema o roles con usuarios asignados
    """
    rol = db.query(RolModel).filter(RolModel.id == rol_id).first()

    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {rol_id} no encontrado",
        )

    # No permitir eliminar roles del sistema
    if rol.es_sistema:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se pueden eliminar roles del sistema",
        )

    # Verificar si hay usuarios con este rol
    usuarios_count = (
        db.query(func.count(UsuarioModel.id))
        .filter(UsuarioModel.rol_id == rol_id)
        .scalar()
    )
    if usuarios_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar el rol porque tiene {usuarios_count} usuario(s) asignado(s)",
        )

    db.delete(rol)
    db.commit()


@router.post("/{rol_id}/permisos", response_model=RolResponse)
async def asignar_permisos_a_rol(
    rol_id: UUID,
    request: AsignarPermisosRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Asignar permisos a un rol
    Solo accesible por administradores
    """
    rol = (
        db.query(RolModel)
        .options(joinedload(RolModel.permisos))
        .filter(RolModel.id == rol_id)
        .first()
    )

    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {rol_id} no encontrado",
        )

    # Verificar que los permisos existan
    permisos = (
        db.query(PermisoModel).filter(PermisoModel.id.in_(request.permisos_ids)).all()
    )
    if len(permisos) != len(request.permisos_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Algunos permisos especificados no existen",
        )

    # Agregar permisos que no estén ya asignados
    permisos_existentes = {p.id for p in rol.permisos}
    for permiso in permisos:
        if permiso.id not in permisos_existentes:
            rol.permisos.append(permiso)

    db.commit()
    db.refresh(rol)

    return rol


@router.delete("/{rol_id}/permisos", response_model=RolResponse)
async def remover_permisos_de_rol(
    rol_id: UUID,
    request: RemoverPermisosRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Remover permisos de un rol
    Solo accesible por administradores
    """
    rol = (
        db.query(RolModel)
        .options(joinedload(RolModel.permisos))
        .filter(RolModel.id == rol_id)
        .first()
    )

    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {rol_id} no encontrado",
        )

    # Remover permisos
    rol.permisos = [p for p in rol.permisos if p.id not in request.permisos_ids]

    db.commit()
    db.refresh(rol)

    return rol
