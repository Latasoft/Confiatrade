"""Endpoints para Participantes"""

from typing import Annotated
from uuid import UUID

from api.schemas.participante import (
    ParticipanteCreate,
    ParticipanteDetailResponse,
    ParticipanteListResponse,
    ParticipanteResponse,
    ParticipanteUpdate,
)
from api.v1.dependencies import (
    actualizar_participante_use_case,
    crear_participante_use_case,
    eliminar_participante_use_case,
    get_all_participantes_use_case,
    get_participante_by_id_use_case,
)
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from core.use_cases.participantes.actualizar_participante import (
    ActualizarParticipanteUseCase,
)
from core.use_cases.participantes.crear_participante import CrearParticipanteUseCase
from core.use_cases.participantes.eliminar_participante import (
    EliminarParticipanteUseCase,
)
from core.use_cases.participantes.get_all_participantes import (
    GetAllParticipantesUseCase,
)
from core.use_cases.participantes.get_participante_by_id import (
    GetParticipanteByIdUseCase,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter()


@router.post(
    "/",
    response_model=ParticipanteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear participante",
    description="Crear un nuevo participante con generación automática de QR",
)
async def crear_participante(
    participante_data: ParticipanteCreate,
    use_case: Annotated[CrearParticipanteUseCase, Depends(crear_participante_use_case)],
):
    """
    Crear participante con validaciones:
    - Empresa debe existir
    - Email único por empresa
    - Generación automática de QR
    """
    try:
        participante = use_case.execute(
            empresa_id=participante_data.empresa_id,
            nombre_completo=participante_data.nombre_completo,
            email=participante_data.email,
            cargo=participante_data.cargo,
            telefono=participante_data.telefono,
            idioma=participante_data.idioma,
            requiere_interprete=participante_data.requiere_interprete,
            foto_url=participante_data.foto_url,
        )
        return participante
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.to_dict())
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict()
        )


@router.get(
    "/",
    response_model=ParticipanteListResponse,
    summary="Listar participantes",
    description="Obtener lista de participantes con filtros opcionales",
)
async def listar_participantes(
    use_case: Annotated[
        GetAllParticipantesUseCase, Depends(get_all_participantes_use_case)
    ],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    empresa_id: UUID | None = Query(None, description="Filtrar por empresa"),
):
    """Listar participantes con paginación y filtros"""
    result = use_case.execute(skip=skip, limit=limit, empresa_id=empresa_id)
    return result


@router.get(
    "/{participante_id}",
    response_model=ParticipanteDetailResponse,
    summary="Obtener participante por ID",
    description="Obtener detalles de un participante específico",
)
async def obtener_participante(
    participante_id: UUID,
    use_case: Annotated[
        GetParticipanteByIdUseCase, Depends(get_participante_by_id_use_case)
    ],
):
    """Obtener participante por ID con datos de empresa"""
    try:
        participante = use_case.execute(participante_id)

        # Construir respuesta con datos de empresa
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
            created_at=participante.created_at,
            updated_at=participante.updated_at,
            empresa_nombre=(
                participante.empresa.nombre if participante.empresa else None
            ),
        )
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())


@router.put(
    "/{participante_id}",
    response_model=ParticipanteResponse,
    summary="Actualizar participante",
    description="Actualizar datos de un participante existente",
)
async def actualizar_participante(
    participante_id: UUID,
    participante_data: ParticipanteUpdate,
    use_case: Annotated[
        ActualizarParticipanteUseCase, Depends(actualizar_participante_use_case)
    ],
):
    """Actualizar participante con validaciones"""
    try:
        participante = use_case.execute(
            participante_id=participante_id,
            nombre_completo=participante_data.nombre_completo,
            cargo=participante_data.cargo,
            email=participante_data.email,
            telefono=participante_data.telefono,
            idioma=participante_data.idioma,
            requiere_interprete=participante_data.requiere_interprete,
            foto_url=participante_data.foto_url,
        )
        return participante
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.to_dict())
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict()
        )


@router.delete(
    "/{participante_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar participante",
    description="Eliminar un participante existente (hard delete)",
)
async def eliminar_participante(
    participante_id: UUID,
    use_case: Annotated[
        EliminarParticipanteUseCase, Depends(eliminar_participante_use_case)
    ],
):
    """Eliminar participante"""
    try:
        result = use_case.execute(participante_id)
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
