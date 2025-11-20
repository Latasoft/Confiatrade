"""Endpoints para gestión de inscripciones de empresas a eventos"""

from typing import Optional
from uuid import UUID

from api.schemas.empresa_evento import (
    EmpresaEventoCreate,
    EmpresaEventoListResponse,
    EmpresaEventoResponse,
    EmpresaEventoUpdate,
)
from api.v1.dependencies import (
    aprobar_inscripcion_use_case,
    cancelar_inscripcion_use_case,
    get_all_inscripciones_use_case,
    inscribir_empresa_use_case,
    listar_empresas_por_evento_use_case,
)
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from core.use_cases.empresas_eventos.aprobar_inscripcion import (
    AprobarInscripcionUseCase,
)
from core.use_cases.empresas_eventos.cancelar_inscripcion import (
    CancelarInscripcionUseCase,
)
from core.use_cases.empresas_eventos.get_all_inscripciones import (
    GetAllInscripcionesUseCase,
)
from core.use_cases.empresas_eventos.inscribir_empresa import InscribirEmpresaUseCase
from core.use_cases.empresas_eventos.listar_empresas_por_evento import (
    ListarEmpresasPorEventoUseCase,
)
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


@router.post(
    "/", response_model=EmpresaEventoResponse, status_code=status.HTTP_201_CREATED
)
def inscribir_empresa(
    inscripcion_data: EmpresaEventoCreate,
    use_case: InscribirEmpresaUseCase = Depends(inscribir_empresa_use_case),
):
    """
    Inscribir una empresa a un evento

    - **empresa_id**: UUID de la empresa
    - **evento_id**: UUID del evento

    Validaciones:
    - La empresa y el evento deben existir
    - El evento debe estar activo y aceptar inscripciones
    - No puede existir inscripción previa
    - El evento no debe haber alcanzado su capacidad máxima
    """
    try:
        inscripcion = use_case.execute(inscripcion_data)
        return inscripcion
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.get("/", response_model=EmpresaEventoListResponse)
def list_inscripciones(
    skip: int = 0,
    limit: int = 100,
    evento_id: Optional[UUID] = None,
    empresa_id: Optional[UUID] = None,
    aprobada: Optional[bool] = None,
    use_case: GetAllInscripcionesUseCase = Depends(get_all_inscripciones_use_case),
):
    """
    Listar inscripciones con filtros opcionales

    - **skip**: Número de registros a omitir (paginación)
    - **limit**: Límite de registros a retornar (máximo 100)
    - **evento_id**: Filtrar por evento específico
    - **empresa_id**: Filtrar por empresa específica
    - **aprobada**: Filtrar por estado de aprobación (true/false)
    """
    inscripciones = use_case.execute(
        skip=skip,
        limit=limit,
        evento_id=evento_id,
        empresa_id=empresa_id,
        aprobada=aprobada,
    )
    stats = use_case.get_stats(evento_id=evento_id, empresa_id=empresa_id)

    return EmpresaEventoListResponse(
        inscripciones=inscripciones,
        total=stats["total"],
        aprobadas=stats["aprobadas"],
        pendientes=stats["pendientes"],
    )


@router.get("/evento/{evento_id}", response_model=EmpresaEventoListResponse)
def list_empresas_por_evento(
    evento_id: UUID,
    aprobada: Optional[bool] = None,
    use_case: ListarEmpresasPorEventoUseCase = Depends(
        listar_empresas_por_evento_use_case
    ),
):
    """
    Listar empresas inscritas en un evento específico

    - **evento_id**: UUID del evento
    - **aprobada**: Filtrar por estado de aprobación (true/false)
    """
    try:
        inscripciones = use_case.execute(evento_id, aprobada)
        stats = use_case.get_stats(evento_id)

        return EmpresaEventoListResponse(
            inscripciones=inscripciones,
            total=stats["total"],
            aprobadas=stats["aprobadas"],
            pendientes=stats["pendientes"],
        )
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{inscripcion_id}", response_model=EmpresaEventoResponse)
def aprobar_inscripcion(
    inscripcion_id: UUID,
    update_data: EmpresaEventoUpdate,
    use_case: AprobarInscripcionUseCase = Depends(aprobar_inscripcion_use_case),
):
    """
    Aprobar o rechazar inscripción de empresa

    - **inscripcion_id**: UUID de la inscripción
    - **aprobada**: true para aprobar, false para rechazar
    """
    try:
        inscripcion = use_case.execute(inscripcion_id, update_data)
        return inscripcion
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{inscripcion_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_inscripcion(
    inscripcion_id: UUID,
    use_case: CancelarInscripcionUseCase = Depends(cancelar_inscripcion_use_case),
):
    """
    Cancelar inscripción de empresa

    Elimina completamente el registro de inscripción.
    """
    try:
        use_case.execute(inscripcion_id)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
