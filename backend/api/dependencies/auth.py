"""Dependencias de autenticación"""

from typing import Optional
from uuid import UUID

from core.security import decode_access_token
from database import get_db
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
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
