"""Endpoints para gestión de eventos"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from api.dependencies.auth import get_current_user
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
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from models.sqlalchemy.evento_model import EventoModel
from models.sqlalchemy.usuario_model import UsuarioModel
from pydantic import BaseModel
from sqlalchemy.orm import Session

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


# ==================== ENDPOINTS ESPECÍFICOS (DEBEN IR ANTES DE /{evento_id}) ====================


class InscripcionResponse(BaseModel):
    """Response para inscripción"""

    id: UUID
    evento_id: UUID
    empresa_id: UUID
    aprobada: bool
    fecha_inscripcion: datetime
    evento: EventoResponse

    class Config:
        from_attributes = True


@router.get("/disponibles", response_model=List[EventoResponse])
def get_eventos_disponibles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    pais_sede: Optional[str] = None,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtener eventos disponibles para inscripción (solo para empresas)

    Filtra eventos con:
    - estado = 'inscripcion_abierta'
    - activo = True
    - La empresa NO está inscrita aún
    """
    if current_user.rol != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo empresas pueden acceder a eventos disponibles",
        )

    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene empresa asociada",
        )

    # Query base: eventos activos con inscripciones abiertas
    query = db.query(EventoModel).filter(
        EventoModel.activo == True, EventoModel.estado == "inscripcion_abierta"
    )

    # Filtro opcional por país
    if pais_sede:
        query = query.filter(EventoModel.pais_sede == pais_sede)

    # Obtener IDs de eventos en los que ya está inscrita
    inscripciones_existentes = (
        db.query(EmpresaEventoModel.evento_id)
        .filter(EmpresaEventoModel.empresa_id == current_user.empresa_id)
        .all()
    )
    eventos_inscritos_ids = [insc[0] for insc in inscripciones_existentes]

    # Excluir eventos ya inscritos
    if eventos_inscritos_ids:
        query = query.filter(~EventoModel.id.in_(eventos_inscritos_ids))

    eventos = query.offset(skip).limit(limit).all()

    return [EventoResponse.model_validate(evento) for evento in eventos]


@router.get("/mis-inscripciones", response_model=List[InscripcionResponse])
def get_mis_inscripciones(
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtener inscripciones de la empresa actual

    Devuelve eventos inscritos con estado de aprobación
    """
    if current_user.rol != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo empresas pueden ver sus inscripciones",
        )

    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene empresa asociada",
        )

    inscripciones = (
        db.query(EmpresaEventoModel)
        .filter(EmpresaEventoModel.empresa_id == current_user.empresa_id)
        .all()
    )

    # Cargar relación con eventos
    for inscripcion in inscripciones:
        db.refresh(inscripcion, ["evento"])

    return [
        InscripcionResponse(
            id=insc.id,
            evento_id=insc.evento_id,
            empresa_id=insc.empresa_id,
            aprobada=insc.aprobada,
            fecha_inscripcion=insc.fecha_inscripcion,
            evento=EventoResponse.model_validate(insc.evento),
        )
        for insc in inscripciones
    ]


# ==================== ENDPOINTS CON PARÁMETROS ====================


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


# ==================== ENDPOINTS PARA EMPRESAS ====================


class InscripcionResponse(BaseModel):
    """Response para inscripción"""

    id: UUID
    evento_id: UUID
    empresa_id: UUID
    aprobada: bool
    fecha_inscripcion: datetime
    evento: EventoResponse

    class Config:
        from_attributes = True


@router.get("/disponibles", response_model=List[EventoResponse])
def get_eventos_disponibles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    pais_sede: Optional[str] = None,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtener eventos disponibles para inscripción (solo para empresas)

    Filtra eventos con:
    - estado = 'inscripcion_abierta'
    - activo = True
    - La empresa NO está inscrita aún
    """
    if current_user.rol != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo empresas pueden acceder a eventos disponibles",
        )

    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene empresa asociada",
        )

    # Query base: eventos activos con inscripciones abiertas
    query = db.query(EventoModel).filter(
        EventoModel.activo == True, EventoModel.estado == "inscripcion_abierta"
    )

    # Filtro opcional por país
    if pais_sede:
        query = query.filter(EventoModel.pais_sede == pais_sede)

    # Obtener IDs de eventos en los que ya está inscrita
    inscripciones_existentes = (
        db.query(EmpresaEventoModel.evento_id)
        .filter(EmpresaEventoModel.empresa_id == current_user.empresa_id)
        .all()
    )
    eventos_inscritos_ids = [insc[0] for insc in inscripciones_existentes]

    # Excluir eventos ya inscritos
    if eventos_inscritos_ids:
        query = query.filter(~EventoModel.id.in_(eventos_inscritos_ids))

    eventos = query.offset(skip).limit(limit).all()

    return [EventoResponse.model_validate(evento) for evento in eventos]


@router.get("/mis-inscripciones", response_model=List[InscripcionResponse])
def get_mis_inscripciones(
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtener inscripciones de la empresa actual

    Devuelve eventos inscritos con estado de aprobación
    """
    if current_user.rol != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo empresas pueden ver sus inscripciones",
        )

    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene empresa asociada",
        )

    inscripciones = (
        db.query(EmpresaEventoModel)
        .filter(EmpresaEventoModel.empresa_id == current_user.empresa_id)
        .all()
    )

    # Cargar relación con eventos
    for inscripcion in inscripciones:
        db.refresh(inscripcion, ["evento"])

    return [
        InscripcionResponse(
            id=insc.id,
            evento_id=insc.evento_id,
            empresa_id=insc.empresa_id,
            aprobada=insc.aprobada,
            fecha_inscripcion=insc.fecha_inscripcion,
            evento=EventoResponse.model_validate(insc.evento),
        )
        for insc in inscripciones
    ]


# ==================== ENDPOINTS CON {evento_id} ====================


@router.post(
    "/{evento_id}/inscribirse",
    response_model=InscripcionResponse,
    status_code=status.HTTP_201_CREATED,
)
def inscribirse_evento(
    evento_id: UUID,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Inscribirse a un evento (solo para empresas aprobadas)

    Crea registro en empresas_eventos con aprobada=False (pendiente aprobación admin)
    """
    if current_user.rol != "empresa":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo empresas pueden inscribirse a eventos",
        )

    if not current_user.empresa_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene empresa asociada",
        )

    # Verificar que la empresa esté aprobada
    if not current_user.empresa or not current_user.empresa.aprobada:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo empresas aprobadas pueden inscribirse a eventos",
        )

    # Verificar que el evento existe y está activo
    evento = db.query(EventoModel).filter(EventoModel.id == evento_id).first()
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado"
        )

    if not evento.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="El evento no está activo"
        )

    if evento.estado != "inscripcion_abierta":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El evento no acepta inscripciones (estado: {evento.estado})",
        )

    # Verificar que no esté inscrito previamente
    inscripcion_existente = (
        db.query(EmpresaEventoModel)
        .filter(
            EmpresaEventoModel.empresa_id == current_user.empresa_id,
            EmpresaEventoModel.evento_id == evento_id,
        )
        .first()
    )

    if inscripcion_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya estás inscrito en este evento",
        )

    # Verificar capacidad disponible
    if evento.capacidad_empresas:
        inscripciones_aprobadas = (
            db.query(EmpresaEventoModel)
            .filter(
                EmpresaEventoModel.evento_id == evento_id,
                EmpresaEventoModel.aprobada == True,
            )
            .count()
        )

        if inscripciones_aprobadas >= evento.capacidad_empresas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El evento ha alcanzado su capacidad máxima",
            )

    # Crear inscripción (pendiente de aprobación)
    nueva_inscripcion = EmpresaEventoModel(
        empresa_id=current_user.empresa_id,
        evento_id=evento_id,
        aprobada=False,
        fecha_inscripcion=datetime.utcnow(),
    )

    db.add(nueva_inscripcion)
    db.commit()
    db.refresh(nueva_inscripcion)

    # Cargar relación con evento para response
    db.refresh(nueva_inscripcion, ["evento"])

    return InscripcionResponse(
        id=nueva_inscripcion.id,
        evento_id=nueva_inscripcion.evento_id,
        empresa_id=nueva_inscripcion.empresa_id,
        aprobada=nueva_inscripcion.aprobada,
        fecha_inscripcion=nueva_inscripcion.fecha_inscripcion,
        evento=EventoResponse.model_validate(nueva_inscripcion.evento),
    )


# ==================== ENDPOINTS ADMIN PARA INSCRIPCIONES ====================


@router.patch(
    "/{evento_id}/inscripciones/{inscripcion_id}/aprobar",
    status_code=status.HTTP_200_OK,
)
def aprobar_inscripcion(
    evento_id: UUID,
    inscripcion_id: UUID,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Aprobar inscripción de una empresa a un evento (solo admin)
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden aprobar inscripciones",
        )

    # Buscar inscripción
    inscripcion = (
        db.query(EmpresaEventoModel)
        .filter(
            EmpresaEventoModel.id == inscripcion_id,
            EmpresaEventoModel.evento_id == evento_id,
        )
        .first()
    )

    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inscripción no encontrada"
        )

    if inscripcion.aprobada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La inscripción ya está aprobada",
        )

    # Verificar capacidad
    evento = db.query(EventoModel).filter(EventoModel.id == evento_id).first()
    if evento and evento.capacidad_empresas:
        inscripciones_aprobadas = (
            db.query(EmpresaEventoModel)
            .filter(
                EmpresaEventoModel.evento_id == evento_id,
                EmpresaEventoModel.aprobada == True,
            )
            .count()
        )

        if inscripciones_aprobadas >= evento.capacidad_empresas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El evento ha alcanzado su capacidad máxima",
            )

    # Aprobar inscripción
    inscripcion.aprobada = True
    db.commit()
    db.refresh(inscripcion)

    return {
        "message": "Inscripción aprobada exitosamente",
        "inscripcion_id": str(inscripcion.id),
    }


@router.patch(
    "/{evento_id}/inscripciones/{inscripcion_id}/rechazar",
    status_code=status.HTTP_200_OK,
)
def rechazar_inscripcion(
    evento_id: UUID,
    inscripcion_id: UUID,
    current_user: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Rechazar/eliminar inscripción de una empresa a un evento (solo admin)
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden rechazar inscripciones",
        )

    # Buscar inscripción
    inscripcion = (
        db.query(EmpresaEventoModel)
        .filter(
            EmpresaEventoModel.id == inscripcion_id,
            EmpresaEventoModel.evento_id == evento_id,
        )
        .first()
    )

    if not inscripcion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inscripción no encontrada"
        )

    # Eliminar inscripción (hard delete)
    db.delete(inscripcion)
    db.commit()

    return {
        "message": "Inscripción rechazada y eliminada exitosamente",
        "inscripcion_id": str(inscripcion_id),
    }
