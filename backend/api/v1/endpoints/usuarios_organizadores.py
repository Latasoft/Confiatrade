"""
Endpoints para gestión de usuarios organizadores
"""

from typing import List, Optional
from uuid import UUID

from api.dependencies.auth import get_current_admin_user
from api.schemas.roles_permisos import (
    AsignarRolRequest,
    CrearOrganizadorRequest,
    PermisosUsuarioResponse,
    UsuarioRolResponse,
    VerificarPermisoRequest,
    VerificarPermisoResponse,
)
from core.security import get_password_hash
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models.sqlalchemy.permiso_model import PermisoModel
from models.sqlalchemy.rol_model import RolModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import Session, joinedload

router = APIRouter()


# ============================================
# ENDPOINTS DE GESTIÓN DE USUARIOS ORGANIZADORES
# ============================================


@router.get("", response_model=List[UsuarioRolResponse])
async def listar_usuarios_organizadores(
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Listar todos los usuarios organizadores
    Solo accesible por administradores
    """
    query = (
        db.query(UsuarioModel)
        .options(joinedload(UsuarioModel.rol_asignado))
        .filter(
            UsuarioModel.empresa_id.is_(
                None
            )  # Usuarios sin empresa son organizadores o admin
        )
    )

    if activo is not None:
        query = query.filter(UsuarioModel.activo == activo)

    usuarios = query.order_by(UsuarioModel.nombre_completo).all()

    # Mapear a respuesta
    resultado = []
    for usuario in usuarios:
        resultado.append(
            {
                "id": usuario.id,
                "email": usuario.email,
                "nombre_completo": usuario.nombre_completo,
                "rol_antiguo": usuario.rol,
                "rol": usuario.rol_asignado,
                "activo": usuario.activo,
                "created_at": usuario.created_at,
            }
        )

    return resultado


@router.post("", response_model=UsuarioRolResponse, status_code=status.HTTP_201_CREATED)
async def crear_usuario_organizador(
    usuario_data: CrearOrganizadorRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Crear un nuevo usuario organizador
    Solo accesible por administradores
    """
    # Verificar que no exista un usuario con ese email
    usuario_existente = (
        db.query(UsuarioModel).filter(UsuarioModel.email == usuario_data.email).first()
    )
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un usuario con el email '{usuario_data.email}'",
        )

    # Verificar que el rol exista
    rol = db.query(RolModel).filter(RolModel.id == usuario_data.rol_id).first()
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {usuario_data.rol_id} no encontrado",
        )

    if not rol.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rol seleccionado no está activo",
        )

    # Crear el usuario
    nuevo_usuario = UsuarioModel(
        email=usuario_data.email,
        hashed_password=get_password_hash(usuario_data.password),
        nombre_completo=usuario_data.nombre_completo,
        rol_id=usuario_data.rol_id,
        rol=rol.nombre.lower(),  # Mantener compatibilidad con campo antiguo
        empresa_id=None,  # Organizadores no tienen empresa
        activo=True,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Cargar la relación del rol
    db.refresh(nuevo_usuario, ["rol_asignado"])

    return {
        "id": nuevo_usuario.id,
        "email": nuevo_usuario.email,
        "nombre_completo": nuevo_usuario.nombre_completo,
        "rol_antiguo": nuevo_usuario.rol,
        "rol": nuevo_usuario.rol_asignado,
        "activo": nuevo_usuario.activo,
        "created_at": nuevo_usuario.created_at,
    }


@router.put("/{usuario_id}/rol", response_model=UsuarioRolResponse)
async def asignar_rol_a_usuario(
    usuario_id: UUID,
    request: AsignarRolRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Asignar un rol a un usuario
    Solo accesible por administradores
    """
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {usuario_id} no encontrado",
        )

    # Verificar que el rol exista
    rol = db.query(RolModel).filter(RolModel.id == request.rol_id).first()
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rol con ID {request.rol_id} no encontrado",
        )

    if not rol.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rol seleccionado no está activo",
        )

    # Asignar el rol
    usuario.rol_id = request.rol_id
    usuario.rol = rol.nombre.lower()  # Mantener compatibilidad

    db.commit()
    db.refresh(usuario)
    db.refresh(usuario, ["rol_asignado"])

    return {
        "id": usuario.id,
        "email": usuario.email,
        "nombre_completo": usuario.nombre_completo,
        "rol_antiguo": usuario.rol,
        "rol": usuario.rol_asignado,
        "activo": usuario.activo,
        "created_at": usuario.created_at,
    }


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Eliminar permanentemente un usuario del sistema
    Solo accesible por administradores
    No se puede eliminar a sí mismo
    """
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {usuario_id} no encontrado",
        )

    # No permitir eliminarse a sí mismo
    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminarte a ti mismo",
        )

    # Verificar si es admin (rol del sistema)
    if usuario.rol == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se pueden eliminar usuarios administradores del sistema",
        )

    db.delete(usuario)
    db.commit()


@router.put("/{usuario_id}/activar", response_model=UsuarioRolResponse)
async def activar_desactivar_usuario(
    usuario_id: UUID,
    activo: bool = Query(..., description="True para activar, False para desactivar"),
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Activar o desactivar un usuario
    Solo accesible por administradores
    """
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {usuario_id} no encontrado",
        )

    # No permitir desactivarse a sí mismo
    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivarte a ti mismo",
        )

    usuario.activo = activo

    db.commit()
    db.refresh(usuario)
    db.refresh(usuario, ["rol_asignado"])

    return {
        "id": usuario.id,
        "email": usuario.email,
        "nombre_completo": usuario.nombre_completo,
        "rol_antiguo": usuario.rol,
        "rol": usuario.rol_asignado,
        "activo": usuario.activo,
        "created_at": usuario.created_at,
    }


# ============================================
# ENDPOINTS DE VERIFICACIÓN DE PERMISOS
# ============================================


@router.post("/{usuario_id}/verificar-permiso", response_model=VerificarPermisoResponse)
async def verificar_permiso_usuario(
    usuario_id: UUID,
    request: VerificarPermisoRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Verificar si un usuario tiene un permiso específico
    Solo accesible por administradores
    """
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {usuario_id} no encontrado",
        )

    # Verificar permiso
    tiene_permiso = False
    if usuario.rol_id:
        tiene_permiso = (
            db.query(PermisoModel)
            .join(RolModel, PermisoModel.roles)
            .filter(
                RolModel.id == usuario.rol_id,
                PermisoModel.nombre == request.permiso_nombre,
                PermisoModel.activo,
                RolModel.activo,
            )
            .first()
            is not None
        )

    return {
        "tiene_permiso": tiene_permiso,
        "usuario_id": usuario_id,
        "permiso_nombre": request.permiso_nombre,
    }


@router.get("/{usuario_id}/permisos", response_model=PermisosUsuarioResponse)
async def obtener_permisos_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Obtener todos los permisos de un usuario
    Solo accesible por administradores
    """
    usuario = (
        db.query(UsuarioModel)
        .options(joinedload(UsuarioModel.rol_asignado).joinedload(RolModel.permisos))
        .filter(UsuarioModel.id == usuario_id)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {usuario_id} no encontrado",
        )

    permisos = []
    if usuario.rol_asignado:
        permisos = [p for p in usuario.rol_asignado.permisos if p.activo]

    return {
        "usuario_id": usuario.id,
        "email": usuario.email,
        "rol": usuario.rol_asignado,
        "permisos": permisos,
    }


@router.get("/mi-perfil/permisos", response_model=PermisosUsuarioResponse)
async def obtener_mis_permisos(
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_admin_user),
):
    """
    Obtener los permisos del usuario autenticado
    Accesible por cualquier usuario autenticado
    """
    usuario = (
        db.query(UsuarioModel)
        .options(joinedload(UsuarioModel.rol_asignado).joinedload(RolModel.permisos))
        .filter(UsuarioModel.id == current_user.id)
        .first()
    )

    permisos = []
    if usuario.rol_asignado:
        permisos = [p for p in usuario.rol_asignado.permisos if p.activo]

    return {
        "usuario_id": usuario.id,
        "email": usuario.email,
        "rol": usuario.rol_asignado,
        "permisos": permisos,
    }
