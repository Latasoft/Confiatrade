"""Endpoints para Bloques Horarios"""

from datetime import date
from typing import Annotated
from uuid import UUID

from api.schemas.bloque_horario import (
    BloqueHorarioCreate,
    BloqueHorarioDetailResponse,
    BloqueHorarioListResponse,
    BloqueHorarioResponse,
    BloqueHorarioUpdate,
    GenerarBloquesRequest,
)
from api.v1.dependencies import (
    actualizar_bloque_horario_use_case,
    crear_bloque_horario_use_case,
    eliminar_bloque_horario_use_case,
    generar_bloques_horarios_use_case,
    get_all_bloques_horarios_use_case,
    get_bloque_horario_by_id_use_case,
)
from core.exceptions import NotFoundException, ValidationException
from core.use_cases.bloques_horarios.actualizar_bloque_horario import (
    ActualizarBloqueHorarioUseCase,
)
from core.use_cases.bloques_horarios.crear_bloque_horario import (
    CrearBloqueHorarioUseCase,
)
from core.use_cases.bloques_horarios.eliminar_bloque_horario import (
    EliminarBloqueHorarioUseCase,
)
from core.use_cases.bloques_horarios.generar_bloques_horarios import (
    GenerarBloquesHorariosUseCase,
)
from core.use_cases.bloques_horarios.get_all_bloques_horarios import (
    GetAllBloquesHorariosUseCase,
)
from core.use_cases.bloques_horarios.get_bloque_horario_by_id import (
    GetBloqueHorarioByIdUseCase,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter()


@router.post(
    "/",
    response_model=BloqueHorarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear bloque horario",
    description="Crear un nuevo bloque horario individual",
)
async def crear_bloque_horario(
    bloque_data: BloqueHorarioCreate,
    use_case: Annotated[
        CrearBloqueHorarioUseCase, Depends(crear_bloque_horario_use_case)
    ],
):
    """
    Crear bloque horario con validaciones:
    - Si se especifica evento_id, debe existir
    - hora_fin > hora_inicio
    """
    try:
        bloque = use_case.execute(
            fecha=bloque_data.fecha,
            hora_inicio=bloque_data.hora_inicio,
            hora_fin=bloque_data.hora_fin,
            duracion_minutos=bloque_data.duracion_minutos,
            evento_id=bloque_data.evento_id,
            ubicacion=bloque_data.ubicacion,
            label=bloque_data.label,
            activo=bloque_data.activo,
        )
        return bloque
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.to_dict())


@router.post(
    "/generar",
    status_code=status.HTTP_201_CREATED,
    summary="Generar bloques automáticamente",
    description="Generar múltiples bloques horarios para un rango de fechas",
)
async def generar_bloques(
    request: GenerarBloquesRequest,
    use_case: Annotated[
        GenerarBloquesHorariosUseCase, Depends(generar_bloques_horarios_use_case)
    ],
):
    """
    Generar bloques automáticamente:
    - Dividir jornada diaria en bloques de duración especificada
    - Crear bloques para cada día del rango
    - Asignar labels automáticos
    """
    try:
        result = use_case.execute(
            fecha_inicio=request.fecha_inicio,
            fecha_fin=request.fecha_fin,
            hora_inicio=request.hora_inicio,
            hora_fin=request.hora_fin,
            duracion_minutos=request.duracion_minutos,
            evento_id=request.evento_id,
            ubicacion=request.ubicacion,
            label_prefijo=request.label_prefijo,
        )
        return {
            "message": f"{result['bloques_creados']} bloques creados exitosamente",
            "total_bloques": result["bloques_creados"],
        }
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.to_dict())


@router.get(
    "/",
    response_model=BloqueHorarioListResponse,
    summary="Listar bloques horarios",
    description="Obtener lista de bloques con filtros opcionales",
)
async def listar_bloques_horarios(
    use_case: Annotated[
        GetAllBloquesHorariosUseCase, Depends(get_all_bloques_horarios_use_case)
    ],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    evento_id: UUID | None = Query(None, description="Filtrar por evento"),
    fecha: date | None = Query(None, description="Filtrar por fecha"),
    activo: bool | None = Query(None, description="Filtrar por estado activo"),
):
    """Listar bloques con paginación y filtros"""
    result = use_case.execute(
        skip=skip, limit=limit, evento_id=evento_id, fecha=fecha, activo=activo
    )
    return result


@router.get(
    "/{bloque_id}",
    response_model=BloqueHorarioDetailResponse,
    summary="Obtener bloque horario por ID",
    description="Obtener detalles de un bloque específico",
)
async def obtener_bloque_horario(
    bloque_id: int,
    use_case: Annotated[
        GetBloqueHorarioByIdUseCase, Depends(get_bloque_horario_by_id_use_case)
    ],
):
    """Obtener bloque por ID con datos de evento"""
    try:
        bloque = use_case.execute(bloque_id)

        return BloqueHorarioDetailResponse(
            id=bloque.id,
            evento_id=bloque.evento_id,
            fecha=bloque.fecha,
            hora_inicio=bloque.hora_inicio,
            hora_fin=bloque.hora_fin,
            duracion_minutos=bloque.duracion_minutos,
            ubicacion=bloque.ubicacion,
            label=bloque.label,
            activo=bloque.activo,
            created_at=bloque.created_at,
            evento_nombre=(bloque.evento.nombre if bloque.evento else None),
        )
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())


@router.put(
    "/{bloque_id}",
    response_model=BloqueHorarioResponse,
    summary="Actualizar bloque horario",
    description="Actualizar datos de un bloque existente",
)
async def actualizar_bloque_horario(
    bloque_id: int,
    bloque_data: BloqueHorarioUpdate,
    use_case: Annotated[
        ActualizarBloqueHorarioUseCase, Depends(actualizar_bloque_horario_use_case)
    ],
):
    """Actualizar bloque con validaciones"""
    try:
        bloque = use_case.execute(
            bloque_id=bloque_id,
            fecha=bloque_data.fecha,
            hora_inicio=bloque_data.hora_inicio,
            hora_fin=bloque_data.hora_fin,
            duracion_minutos=bloque_data.duracion_minutos,
            ubicacion=bloque_data.ubicacion,
            label=bloque_data.label,
            activo=bloque_data.activo,
        )
        return bloque
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.to_dict())


@router.delete(
    "/{bloque_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar bloque horario",
    description="Eliminar un bloque existente (hard delete)",
)
async def eliminar_bloque_horario(
    bloque_id: int,
    use_case: Annotated[
        EliminarBloqueHorarioUseCase, Depends(eliminar_bloque_horario_use_case)
    ],
):
    """Eliminar bloque"""
    try:
        result = use_case.execute(bloque_id)
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.to_dict())
