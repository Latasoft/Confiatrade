"""Endpoints para gestión de eventos"""

from typing import Optional
from uuid import UUID

from api.schemas.evento import (
    EventoCreate,
    EventoListResponse,
    EventoResponse,
    EventoUpdate,
)
from api.v1.dependencies import (
    create_evento_use_case,
    delete_evento_use_case,
    get_all_eventos_use_case,
    get_evento_by_id_use_case,
    update_evento_use_case,
)
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from core.use_cases.eventos.create_evento import CreateEventoUseCase
from core.use_cases.eventos.delete_evento import DeleteEventoUseCase
from core.use_cases.eventos.get_all_eventos import GetAllEventosUseCase
from core.use_cases.eventos.get_evento_by_id import GetEventoByIdUseCase
from core.use_cases.eventos.update_evento import UpdateEventoUseCase
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


@router.post("/", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def create_evento(
    evento_data: EventoCreate,
    use_case: CreateEventoUseCase = Depends(create_evento_use_case),
):
    """
    Crear un nuevo evento

    - **nombre**: Nombre del evento (3-255 caracteres)
    - **ciudad_sede**: Ciudad donde se realiza
    - **pais_sede**: País donde se realiza
    - **fecha_inicio**: Fecha de inicio
    - **fecha_fin**: Fecha de finalización
    - **tipo**: Tipo de evento (B2B, Networking, Feria, Conferencia, Otro)
    - **descripcion**: Descripción opcional
    - **capacidad_empresas**: Capacidad máxima de empresas (1-1000)
    """
    try:
        evento = use_case.execute(evento_data)
        return evento
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=EventoListResponse)
def list_eventos(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    estado: Optional[str] = None,
    use_case: GetAllEventosUseCase = Depends(get_all_eventos_use_case),
):
    """
    Listar eventos con filtros opcionales

    - **skip**: Número de registros a omitir (paginación)
    - **limit**: Límite de registros a retornar (máximo 100)
    - **activo**: Filtrar por eventos activos/inactivos
    - **estado**: Filtrar por estado (planificacion, inscripciones_abiertas, en_curso, finalizado, cancelado)
    """
    eventos = use_case.execute(skip=skip, limit=limit, activo=activo, estado=estado)
    stats = use_case.get_stats()

    return EventoListResponse(
        eventos=eventos,
        total=stats["total"],
        activos=stats["activos"],
        finalizados=stats["finalizados"],
    )


@router.get("/{evento_id}", response_model=EventoResponse)
def get_evento(
    evento_id: UUID,
    use_case: GetEventoByIdUseCase = Depends(get_evento_by_id_use_case),
):
    """
    Obtener un evento por su ID
    """
    try:
        evento = use_case.execute(evento_id)
        return evento
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{evento_id}", response_model=EventoResponse)
def update_evento(
    evento_id: UUID,
    update_data: EventoUpdate,
    use_case: UpdateEventoUseCase = Depends(update_evento_use_case),
):
    """
    Actualizar un evento existente

    Solo se actualizan los campos proporcionados (actualización parcial)
    """
    try:
        evento = use_case.execute(evento_id, update_data)
        return evento
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evento(
    evento_id: UUID,
    use_case: DeleteEventoUseCase = Depends(delete_evento_use_case),
):
    """
    Eliminar un evento (soft delete)

    El evento se marca como inactivo pero no se elimina de la base de datos.
    No se puede eliminar si tiene empresas inscritas.
    """
    try:
        use_case.execute(evento_id)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
