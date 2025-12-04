"""Endpoints para Reuniones"""

from typing import Annotated
from uuid import UUID

from api.schemas.reunion import (
    ReunionCreate,
    ReunionDetailResponse,
    ReunionListResponse,
    ReunionUpdate,
)
from api.v1.dependencies import (
    actualizar_reunion_use_case,
    crear_reunion_use_case,
    eliminar_reunion_use_case,
    get_all_reuniones_use_case,
    get_reunion_by_id_use_case,
)
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from core.use_cases.reuniones.actualizar_reunion import ActualizarReunionUseCase
from core.use_cases.reuniones.crear_reunion import CrearReunionUseCase
from core.use_cases.reuniones.eliminar_reunion import EliminarReunionUseCase
from core.use_cases.reuniones.get_all_reuniones import GetAllReunionesUseCase
from core.use_cases.reuniones.get_reunion_by_id import GetReunionByIdUseCase
from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter()


@router.post(
    "/",
    response_model=ReunionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear reunión",
    description="Crear una nueva reunión con validaciones completas",
)
async def crear_reunion(
    reunion_data: ReunionCreate,
    use_case: Annotated[CrearReunionUseCase, Depends(crear_reunion_use_case)],
):
    """
    Crear reunión con validaciones:
    - Empresas distintas (empresa_a_id != empresa_b_id)
    - Ambas empresas existen
    - Bloque existe y está activo
    - Ambas empresas disponibles en el bloque
    - Si bloque tiene evento, ambas empresas inscritas
    """
    try:
        reunion = use_case.execute(
            bloque_id=reunion_data.bloque_id,
            empresa_a_id=reunion_data.empresa_a_id,
            empresa_b_id=reunion_data.empresa_b_id,
            estado=reunion_data.estado,
            notas=reunion_data.notas,
            requiere_interprete=reunion_data.requiere_interprete,
            sala=reunion_data.sala,
            resultado=reunion_data.resultado,
        )
        # Construir response detallado con campos planos calculados
        return ReunionDetailResponse(
            id=reunion.id,
            bloque_id=reunion.bloque_id,
            empresa_a_id=reunion.empresa_a_id,
            empresa_b_id=reunion.empresa_b_id,
            estado=reunion.estado,
            notas=reunion.notas,
            requiere_interprete=reunion.requiere_interprete,
            sala=reunion.sala,
            resultado=reunion.resultado,
            created_at=reunion.created_at,
            updated_at=reunion.updated_at,
            empresa_a_nombre=(reunion.empresa_a.nombre if reunion.empresa_a else None),
            empresa_b_nombre=(reunion.empresa_b.nombre if reunion.empresa_b else None),
            bloque_fecha=(str(reunion.bloque.fecha) if reunion.bloque else None),
            bloque_hora_inicio=(
                str(reunion.bloque.hora_inicio) if reunion.bloque else None
            ),
            bloque_hora_fin=(str(reunion.bloque.hora_fin) if reunion.bloque else None),
            bloque_ubicacion=(reunion.bloque.ubicacion if reunion.bloque else None),
            evento_id=(reunion.bloque.evento_id if reunion.bloque else None),
            evento_nombre=(
                reunion.bloque.evento.nombre
                if reunion.bloque and reunion.bloque.evento
                else None
            ),
        )
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.to_dict())
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.to_dict()
        )
    except Exception as e:
        import traceback

        print(f"Error creating reunion: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Error interno al crear reunión", "error": str(e)},
        )


@router.get(
    "/",
    response_model=ReunionListResponse,
    summary="Listar reuniones",
    description="Obtener lista de reuniones con filtros opcionales",
)
async def listar_reuniones(
    use_case: Annotated[GetAllReunionesUseCase, Depends(get_all_reuniones_use_case)],
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    empresa_id: UUID | None = Query(None, description="Filtrar por empresa (A o B)"),
    bloque_id: int | None = Query(None, description="Filtrar por bloque"),
    estado: str | None = Query(None, description="Filtrar por estado"),
    sala: str | None = Query(None, description="Filtrar por sala"),
    evento_id: UUID | None = Query(None, description="Filtrar por evento"),
):
    """Listar reuniones con paginación y múltiples filtros"""
    result = use_case.execute(
        skip=skip,
        limit=limit,
        empresa_id=empresa_id,
        bloque_id=bloque_id,
        estado=estado,
        sala=sala,
        evento_id=evento_id,
    )
    return result


@router.get(
    "/{reunion_id}",
    response_model=ReunionDetailResponse,
    summary="Obtener reunión por ID",
    description="Obtener detalles de una reunión específica",
)
async def obtener_reunion(
    reunion_id: UUID,
    use_case: Annotated[GetReunionByIdUseCase, Depends(get_reunion_by_id_use_case)],
):
    """Obtener reunión por ID con todos los datos relacionados"""
    try:
        reunion = use_case.execute(reunion_id)

        return ReunionDetailResponse(
            id=reunion.id,
            bloque_id=reunion.bloque_id,
            empresa_a_id=reunion.empresa_a_id,
            empresa_b_id=reunion.empresa_b_id,
            estado=reunion.estado,
            notas=reunion.notas,
            requiere_interprete=reunion.requiere_interprete,
            sala=reunion.sala,
            resultado=reunion.resultado,
            created_at=reunion.created_at,
            updated_at=reunion.updated_at,
            empresa_a_nombre=(reunion.empresa_a.nombre if reunion.empresa_a else None),
            empresa_b_nombre=(reunion.empresa_b.nombre if reunion.empresa_b else None),
            bloque_fecha=(str(reunion.bloque.fecha) if reunion.bloque else None),
            bloque_hora_inicio=(
                str(reunion.bloque.hora_inicio) if reunion.bloque else None
            ),
            bloque_hora_fin=(str(reunion.bloque.hora_fin) if reunion.bloque else None),
            bloque_ubicacion=(reunion.bloque.ubicacion if reunion.bloque else None),
            evento_id=(reunion.bloque.evento_id if reunion.bloque else None),
            evento_nombre=(
                reunion.bloque.evento.nombre
                if reunion.bloque and reunion.bloque.evento
                else None
            ),
        )
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())


@router.put(
    "/{reunion_id}",
    response_model=ReunionDetailResponse,
    summary="Actualizar reunión",
    description="Actualizar datos de una reunión existente",
)
async def actualizar_reunion(
    reunion_id: UUID,
    reunion_data: ReunionUpdate,
    use_case: Annotated[ActualizarReunionUseCase, Depends(actualizar_reunion_use_case)],
):
    """Actualizar reunión (empresas no se pueden cambiar, pero bloque sí)"""
    try:
        reunion = use_case.execute(
            reunion_id=reunion_id,
            bloque_id=reunion_data.bloque_id,
            estado=reunion_data.estado,
            notas=reunion_data.notas,
            requiere_interprete=reunion_data.requiere_interprete,
            sala=reunion_data.sala,
            resultado=reunion_data.resultado,
        )
        # Construir response detallado con campos planos calculados
        return ReunionDetailResponse(
            id=reunion.id,
            bloque_id=reunion.bloque_id,
            empresa_a_id=reunion.empresa_a_id,
            empresa_b_id=reunion.empresa_b_id,
            estado=reunion.estado,
            notas=reunion.notas,
            requiere_interprete=reunion.requiere_interprete,
            sala=reunion.sala,
            resultado=reunion.resultado,
            created_at=reunion.created_at,
            updated_at=reunion.updated_at,
            empresa_a_nombre=(reunion.empresa_a.nombre if reunion.empresa_a else None),
            empresa_b_nombre=(reunion.empresa_b.nombre if reunion.empresa_b else None),
            bloque_fecha=(str(reunion.bloque.fecha) if reunion.bloque else None),
            bloque_hora_inicio=(
                str(reunion.bloque.hora_inicio) if reunion.bloque else None
            ),
            bloque_hora_fin=(str(reunion.bloque.hora_fin) if reunion.bloque else None),
            bloque_ubicacion=(reunion.bloque.ubicacion if reunion.bloque else None),
            evento_id=(reunion.bloque.evento_id if reunion.bloque else None),
            evento_nombre=(
                reunion.bloque.evento.nombre
                if reunion.bloque and reunion.bloque.evento
                else None
            ),
        )
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())


@router.delete(
    "/{reunion_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar reunión",
    description="Eliminar una reunión existente (hard delete)",
)
async def eliminar_reunion(
    reunion_id: UUID,
    use_case: Annotated[EliminarReunionUseCase, Depends(eliminar_reunion_use_case)],
):
    """Eliminar reunión"""
    try:
        result = use_case.execute(reunion_id)
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except Exception as e:
        import traceback

        print(f"Error deleting reunion: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Error interno al eliminar reunión", "error": str(e)},
        )
