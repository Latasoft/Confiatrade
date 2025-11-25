"""Endpoints de autenticación"""

from api.dependencies.auth import get_current_user
from api.schemas.auth import (
    CambiarPassword,
    EmpresaRegistro,
    PerfilUsuario,
    TokenResponse,
    UsuarioLogin,
    UsuarioResponse,
)
from core.security import create_access_token, verify_password
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models.sqlalchemy.usuario_model import UsuarioModel
from repositories.postgres.usuario_repository import UsuarioRepository
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UsuarioLogin, db: Session = Depends(get_db)):
    """Login para admin y empresas"""
    repo = UsuarioRepository(db)
    usuario = repo.get_by_email(credentials.email)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if not verify_password(credentials.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacte al administrador",
        )

    # Crear token
    access_token = create_access_token(
        data={"sub": str(usuario.id), "email": usuario.email, "rol": usuario.rol}
    )

    return TokenResponse(
        access_token=access_token, user=UsuarioResponse.model_validate(usuario)
    )


@router.post("/registro-empresa", response_model=TokenResponse)
async def registro_empresa(datos: EmpresaRegistro, db: Session = Depends(get_db)):
    """Registro de nueva empresa con su usuario"""
    from datetime import datetime
    from uuid import uuid4

    from models.sqlalchemy.empresa import EmpresaModel

    usuario_repo = UsuarioRepository(db)

    # Verificar que el email no exista
    if usuario_repo.get_by_email(datos.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

    try:
        # Crear empresa directamente con el modelo
        empresa_model = EmpresaModel(
            id=uuid4(),
            nombre=datos.nombre_empresa,
            pais_id=datos.pais_id,
            sector_id=datos.sector_id,
            descripcion=datos.descripcion,
            sitio_web=datos.sitio_web,
            telefono=datos.telefono,
            email=datos.email,
            direccion=datos.direccion,
            aprobada=False,  # Requiere aprobación del admin
            fecha_registro=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(empresa_model)
        db.flush()  # Para obtener el ID antes del commit

        # Crear usuario vinculado a la empresa
        usuario = usuario_repo.create(
            email=datos.email,
            password=datos.password,
            nombre_completo=datos.nombre_completo,
            rol="empresa",
            empresa_id=empresa_model.id,
        )

        db.commit()
        db.refresh(usuario)
        db.refresh(empresa_model)

        # Crear token
        access_token = create_access_token(
            data={"sub": str(usuario.id), "email": usuario.email, "rol": usuario.rol}
        )

        return TokenResponse(
            access_token=access_token, user=UsuarioResponse.model_validate(usuario)
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear empresa: {str(e)}",
        )


@router.get("/perfil", response_model=PerfilUsuario)
async def get_perfil(current_user: UsuarioModel = Depends(get_current_user)):
    """Obtiene el perfil del usuario actual"""
    from api.schemas.auth import EmpresaPerfilResponse

    # Construir empresa_data si el usuario es de empresa
    empresa_data = None
    if current_user.rol == "empresa" and current_user.empresa:
        empresa_data = EmpresaPerfilResponse(
            id=current_user.empresa.id,
            nombre=current_user.empresa.nombre,
            email=current_user.empresa.email,
            telefono=current_user.empresa.telefono,
            sitio_web=current_user.empresa.sitio_web,
            aprobada=current_user.empresa.aprobada,
            pais_id=current_user.empresa.pais_id,
            sector_id=current_user.empresa.sector_id,
            presentacion_url=current_user.empresa.presentacion_url,
            descripcion=current_user.empresa.descripcion,
            direccion=current_user.empresa.direccion,
            pais_nombre=current_user.empresa.pais_nombre,
            sector_nombre=current_user.empresa.sector_nombre,
        )

    return PerfilUsuario(
        id=current_user.id,
        email=current_user.email,
        nombre_completo=current_user.nombre_completo,
        rol=current_user.rol,
        activo=current_user.activo,
        created_at=current_user.created_at,
        empresa=empresa_data,
    )


@router.post("/cambiar-password")
async def cambiar_password(
    datos: CambiarPassword,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cambia la contraseña del usuario actual"""
    # Verificar contraseña actual
    if not verify_password(datos.password_actual, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta",
        )

    # Actualizar contraseña
    repo = UsuarioRepository(db)
    repo.update_password(current_user.id, datos.password_nuevo)

    return {"message": "Contraseña actualizada exitosamente"}


@router.get("/verificar-token", response_model=UsuarioResponse)
async def verificar_token(current_user: UsuarioModel = Depends(get_current_user)):
    """Verifica que el token sea válido y retorna el usuario"""
    return UsuarioResponse.model_validate(current_user)
