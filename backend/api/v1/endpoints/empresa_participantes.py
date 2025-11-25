"""Endpoints para gestión de participantes por parte de empresas"""

from typing import Annotated
from uuid import UUID

from api.dependencies.auth import get_current_empresa_id
from api.schemas.participante import (
    ParticipanteDetailResponse,
    ParticipanteListResponse,
    ParticipanteUpdate,
)
from api.v1.dependencies import (
    actualizar_mi_participante_use_case,
    crear_mi_participante_use_case,
    eliminar_mi_participante_use_case,
    get_mi_participante_by_id_use_case,
    get_mis_participantes_use_case,
)
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from core.use_cases.empresas.actualizar_mi_participante import (
    ActualizarMiParticipanteUseCase,
)
from core.use_cases.empresas.crear_mi_participante import CrearMiParticipanteUseCase
from core.use_cases.empresas.eliminar_mi_participante import (
    EliminarMiParticipanteUseCase,
)
from core.use_cases.empresas.get_mi_participante_by_id import (
    GetMiParticipanteByIdUseCase,
)
from core.use_cases.empresas.get_mis_participantes import GetMisParticipantesUseCase
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field

router = APIRouter()


class MiParticipanteCreate(BaseModel):
    """Schema para crear participante (sin empresa_id, viene del token)"""

    nombre_completo: str = Field(..., min_length=1, max_length=255)
    cargo: str | None = Field(None, max_length=150)
    email: EmailStr
    telefono: str | None = Field(None, max_length=50)
    idioma: str = Field(default="ES", max_length=2)
    requiere_interprete: bool = Field(default=False)
    foto_url: str | None = Field(None, max_length=500)


@router.get(
    "/",
    response_model=ParticipanteListResponse,
    summary="Listar mis participantes",
    description="Obtener lista de participantes de la empresa autenticada",
)
async def listar_mis_participantes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    empresa_id: Annotated[UUID, Depends(get_current_empresa_id)] = None,
    use_case: Annotated[
        GetMisParticipantesUseCase, Depends(get_mis_participantes_use_case)
    ] = None,
):
    """
    Listar participantes de la empresa autenticada con paginación
    """
    try:
        participantes = use_case.execute(empresa_id=empresa_id, skip=skip, limit=limit)

        # Construir response con empresa_nombre
        items = []
        for p in participantes:
            items.append(
                ParticipanteDetailResponse(
                    id=p.id,
                    empresa_id=p.empresa_id,
                    nombre_completo=p.nombre_completo,
                    cargo=p.cargo,
                    email=p.email,
                    telefono=p.telefono,
                    idioma=p.idioma,
                    requiere_interprete=p.requiere_interprete,
                    foto_url=p.foto_url,
                    qr_data=p.qr_data,
                    check_in_realizado=p.check_in_realizado,
                    fecha_check_in=p.fecha_check_in,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                    empresa_nombre=p.empresa.nombre if p.empresa else None,
                )
            )

        return ParticipanteListResponse(
            total=len(items), skip=skip, limit=limit, items=items
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar participantes: {str(e)}",
        )


@router.post(
    "/",
    response_model=ParticipanteDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear participante",
    description="Crear un nuevo participante en tu empresa con generación automática de QR",
)
async def crear_mi_participante(
    participante_data: MiParticipanteCreate,
    empresa_id: Annotated[UUID, Depends(get_current_empresa_id)] = None,
    use_case: Annotated[
        CrearMiParticipanteUseCase, Depends(crear_mi_participante_use_case)
    ] = None,
):
    """
    Crear participante para la empresa autenticada
    """
    try:
        participante = use_case.execute(
            empresa_id=empresa_id,
            nombre_completo=participante_data.nombre_completo,
            email=participante_data.email,
            cargo=participante_data.cargo,
            telefono=participante_data.telefono,
            idioma=participante_data.idioma,
            requiere_interprete=participante_data.requiere_interprete,
            foto_url=participante_data.foto_url,
        )

        return ParticipanteDetailResponse(
            id=participante.id,
            empresa_id=participante.empresa_id,
            nombre_completo=participante.nombre_completo,
            cargo=participante.cargo,
            email=participante.email,
            telefono=participante.telefono,
            idioma=participante.idioma,
            requiere_interprete=participante.requiere_interprete,
            foto_url=participante.foto_url,
            qr_data=participante.qr_data,
            check_in_realizado=participante.check_in_realizado,
            fecha_check_in=participante.fecha_check_in,
            created_at=participante.created_at,
            updated_at=participante.updated_at,
            empresa_nombre=participante.empresa.nombre
            if participante.empresa
            else None,
        )

    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear participante: {str(e)}",
        )


@router.get(
    "/{participante_id}",
    response_model=ParticipanteDetailResponse,
    summary="Obtener participante",
    description="Obtener detalles de un participante de tu empresa",
)
async def obtener_mi_participante(
    participante_id: UUID,
    empresa_id: Annotated[UUID, Depends(get_current_empresa_id)] = None,
    use_case: Annotated[
        GetMiParticipanteByIdUseCase, Depends(get_mi_participante_by_id_use_case)
    ] = None,
):
    """
    Obtener participante por ID validando que pertenezca a la empresa
    """
    try:
        participante = use_case.execute(
            participante_id=participante_id, empresa_id=empresa_id
        )

        return ParticipanteDetailResponse(
            id=participante.id,
            empresa_id=participante.empresa_id,
            nombre_completo=participante.nombre_completo,
            cargo=participante.cargo,
            email=participante.email,
            telefono=participante.telefono,
            idioma=participante.idioma,
            requiere_interprete=participante.requiere_interprete,
            foto_url=participante.foto_url,
            qr_data=participante.qr_data,
            check_in_realizado=participante.check_in_realizado,
            fecha_check_in=participante.fecha_check_in,
            created_at=participante.created_at,
            updated_at=participante.updated_at,
            empresa_nombre=participante.empresa.nombre
            if participante.empresa
            else None,
        )

    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener participante: {str(e)}",
        )


@router.put(
    "/{participante_id}",
    response_model=ParticipanteDetailResponse,
    summary="Actualizar participante",
    description="Actualizar información de un participante de tu empresa",
)
async def actualizar_mi_participante(
    participante_id: UUID,
    participante_data: ParticipanteUpdate,
    empresa_id: Annotated[UUID, Depends(get_current_empresa_id)] = None,
    use_case: Annotated[
        ActualizarMiParticipanteUseCase, Depends(actualizar_mi_participante_use_case)
    ] = None,
):
    """
    Actualizar participante validando que pertenezca a la empresa
    """
    try:
        participante = use_case.execute(
            participante_id=participante_id,
            empresa_id=empresa_id,
            nombre_completo=participante_data.nombre_completo,
            cargo=participante_data.cargo,
            email=participante_data.email,
            telefono=participante_data.telefono,
            idioma=participante_data.idioma,
            requiere_interprete=participante_data.requiere_interprete,
            foto_url=participante_data.foto_url,
        )

        return ParticipanteDetailResponse(
            id=participante.id,
            empresa_id=participante.empresa_id,
            nombre_completo=participante.nombre_completo,
            cargo=participante.cargo,
            email=participante.email,
            telefono=participante.telefono,
            idioma=participante.idioma,
            requiere_interprete=participante.requiere_interprete,
            foto_url=participante.foto_url,
            qr_data=participante.qr_data,
            check_in_realizado=participante.check_in_realizado,
            fecha_check_in=participante.fecha_check_in,
            created_at=participante.created_at,
            updated_at=participante.updated_at,
            empresa_nombre=participante.empresa.nombre
            if participante.empresa
            else None,
        )

    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar participante: {str(e)}",
        )


@router.delete(
    "/{participante_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar participante",
    description="Eliminar un participante de tu empresa",
)
async def eliminar_mi_participante(
    participante_id: UUID,
    empresa_id: Annotated[UUID, Depends(get_current_empresa_id)] = None,
    use_case: Annotated[
        EliminarMiParticipanteUseCase, Depends(eliminar_mi_participante_use_case)
    ] = None,
):
    """
    Eliminar participante validando que pertenezca a la empresa
    """
    try:
        use_case.execute(participante_id=participante_id, empresa_id=empresa_id)
        return None

    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar participante: {str(e)}",
        )
