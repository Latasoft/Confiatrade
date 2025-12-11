"""Dependencias de autenticación"""

import logging
from typing import List, Optional
from uuid import UUID

logger = logging.getLogger(__name__)

from core.security import decode_access_token
from database import get_db
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from models.sqlalchemy.permiso_model import PermisoModel
from models.sqlalchemy.rol_model import RolModel
from models.sqlalchemy.usuario_model import UsuarioModel
from repositories.postgres.usuario_repository import UsuarioRepository
from sqlalchemy.orm import Session

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> UsuarioModel:
    """Obtiene el usuario actual desde el token JWT"""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    repo = UsuarioRepository(db)
    usuario = repo.get_by_id(UUID(user_id))

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )

    return usuario


async def get_current_admin(
    current_user: UsuarioModel = Depends(get_current_user),
) -> UsuarioModel:
    """Verifica que el usuario actual sea administrador"""
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador",
        )
    return current_user


async def get_current_empresa_user(
    current_user: UsuarioModel = Depends(get_current_user),
) -> UsuarioModel:
    """Verifica que el usuario actual sea de tipo empresa"""
    if current_user.rol != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso solo para usuarios de empresa",
        )
    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene empresa asociada",
        )
    return current_user


def get_current_empresa_id(
    current_user: UsuarioModel = Depends(get_current_empresa_user),
) -> UUID:
    """Obtiene el empresa_id del usuario empresa autenticado"""
    return current_user.empresa_id


# ============================================
# NUEVAS DEPENDENCIAS CON SISTEMA DE ROLES
# ============================================


async def get_current_admin_user(
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UsuarioModel:
    """
    Verifica que el usuario actual sea administrador (usando nuevo sistema de roles)
    Mantiene compatibilidad con rol antiguo
    """
    logger.info(
        f"[AUTH] Verificando admin - Usuario: {current_user.email}, rol={current_user.rol}, rol_id={current_user.rol_id}"
    )

    # Verificar rol antiguo primero (compatibilidad)
    if current_user.rol == "admin":
        logger.info("[AUTH] Usuario es admin (sistema antiguo)")
        return current_user

    # Verificar nuevo sistema de roles
    if current_user.rol_id:
        logger.info(f"[AUTH] Buscando rol con ID: {current_user.rol_id}")
        rol = db.query(RolModel).filter(RolModel.id == current_user.rol_id).first()
        logger.info(
            f"[AUTH] Rol encontrado: {rol.nombre if rol else 'None'}, activo: {rol.activo if rol else 'N/A'}"
        )

        if rol and rol.nombre == "Administrador" and rol.activo:
            logger.info("[AUTH] Usuario es Administrador (nuevo sistema)")
            return current_user

    logger.warning(f"[AUTH] Usuario {current_user.email} NO es administrador")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tienes permisos de administrador",
    )


def require_permission(permission_name: str):
    """
    Dependency factory para verificar que el usuario tenga un permiso específico

    Uso:
        @router.get("/empresas", dependencies=[Depends(require_permission("ver_empresas"))])
    """

    async def permission_checker(
        current_user: UsuarioModel = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> UsuarioModel:
        # Administradores tienen todos los permisos
        if current_user.rol == "admin":
            return current_user

        # Verificar si usuario tiene el permiso a través de su rol
        if not current_user.rol_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes el permiso requerido: {permission_name}",
            )

        # Consultar si el usuario tiene el permiso
        tiene_permiso = (
            db.query(PermisoModel)
            .join(RolModel, PermisoModel.roles)
            .filter(
                RolModel.id == current_user.rol_id,
                PermisoModel.nombre == permission_name,
                PermisoModel.activo == True,
                RolModel.activo == True,
            )
            .first()
            is not None
        )

        if not tiene_permiso:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes el permiso requerido: {permission_name}",
            )

        return current_user

    return permission_checker


def require_any_permission(permission_names: List[str]):
    """
    Dependency factory para verificar que el usuario tenga al menos uno de los permisos especificados

    Uso:
        @router.get("/empresas", dependencies=[Depends(require_any_permission(["ver_empresas", "editar_empresa"]))])
    """

    async def permission_checker(
        current_user: UsuarioModel = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> UsuarioModel:
        # Administradores tienen todos los permisos
        if current_user.rol == "admin":
            return current_user

        # Verificar si usuario tiene alguno de los permisos
        if not current_user.rol_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes ninguno de los permisos requeridos",
            )

        # Consultar si el usuario tiene alguno de los permisos
        tiene_permiso = (
            db.query(PermisoModel)
            .join(RolModel, PermisoModel.roles)
            .filter(
                RolModel.id == current_user.rol_id,
                PermisoModel.nombre.in_(permission_names),
                PermisoModel.activo == True,
                RolModel.activo == True,
            )
            .first()
            is not None
        )

        if not tiene_permiso:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes ninguno de los permisos requeridos: {', '.join(permission_names)}",
            )

        return current_user

    return permission_checker


async def get_user_permissions(
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[str]:
    """
    Obtiene la lista de nombres de permisos del usuario actual
    Útil para lógica condicional en endpoints
    """
    # Administradores tienen todos los permisos
    if current_user.rol == "admin":
        return ["*"]  # Comodín para todos los permisos

    if not current_user.rol_id:
        return []

    # Obtener permisos del usuario
    permisos = (
        db.query(PermisoModel)
        .join(RolModel, PermisoModel.roles)
        .filter(
            RolModel.id == current_user.rol_id,
            PermisoModel.activo == True,
            RolModel.activo == True,
        )
        .all()
    )

    return [p.nombre for p in permisos]
