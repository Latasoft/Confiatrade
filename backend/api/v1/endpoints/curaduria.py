"""Endpoints para Curaduría (Matching System)"""

from uuid import UUID

from api.schemas.curaduria import (
    CuraduriaCreate,
    CuraduriaDetailResponse,
    CuraduriaListResponse,
    CuraduriaUpdate,
    MatchListResponse,
)
from api.v1.dependencies import (
    get_actualizar_curaduria_use_case,
    get_calcular_matches_use_case,
    get_crear_curaduria_use_case,
    get_eliminar_curaduria_use_case,
    get_listar_curaduria_use_case,
    get_obtener_curaduria_use_case,
)
from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from core.use_cases.curaduria.actualizar_curaduria import ActualizarCuraduriaUseCase
from core.use_cases.curaduria.calcular_matches import CalcularMatchesUseCase
from core.use_cases.curaduria.crear_curaduria import CrearCuraduriaUseCase
from core.use_cases.curaduria.eliminar_curaduria import EliminarCuraduriaUseCase
from core.use_cases.curaduria.listar_curaduria import ListarCuraduriasUseCase
from core.use_cases.curaduria.obtener_curaduria import ObtenerCuraduriaUseCase
from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter(prefix="/curaduria", tags=["Curaduría"])


@router.post(
    "/",
    response_model=CuraduriaDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear curaduría",
    description="Crear curaduría para una empresa (1:1 relationship)",
)
def crear_curaduria(
    curaduria_data: CuraduriaCreate,
    use_case: CrearCuraduriaUseCase = Depends(get_crear_curaduria_use_case),
):
    """Crear curaduría con validaciones"""
    try:
        curaduria = use_case.execute(
            empresa_id=curaduria_data.empresa_id,
            ofrece=curaduria_data.ofrece,
            busca=curaduria_data.busca,
            objetivos=curaduria_data.objetivos,
            capacidades=curaduria_data.capacidades,
            notas_internas=curaduria_data.notas_internas,
        )
        return curaduria
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except BusinessLogicException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear curaduría: {str(e)}",
        )


@router.get(
    "/",
    response_model=CuraduriaListResponse,
    summary="Listar curadurías",
    description="Listar todas las curadurías con paginación",
)
def listar_curaduria(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=500, description="Límite de registros"),
    use_case: ListarCuraduriasUseCase = Depends(get_listar_curaduria_use_case),
):
    """Listar curadurías con paginación"""
    try:
        result = use_case.execute(skip=skip, limit=limit)
        return CuraduriaListResponse(
            curaduria=result["curaduria"], total=result["total"]
        )
    except Exception as e:
        raise ValidationException(message=f"Error al listar curadurías: {str(e)}")


@router.get(
    "/{curaduria_id}",
    response_model=CuraduriaDetailResponse,
    summary="Obtener curaduría",
    description="Obtener curaduría por ID con datos de empresa",
)
def obtener_curaduria(
    curaduria_id: UUID,
    use_case: ObtenerCuraduriaUseCase = Depends(get_obtener_curaduria_use_case),
):
    """Obtener curaduría por ID"""
    try:
        curaduria = use_case.execute(curaduria_id=curaduria_id)
        return curaduria
    except NotFoundException as e:
        raise NotFoundException(message=e.message, details=e.details)
    except Exception as e:
        raise ValidationException(message=f"Error al obtener curaduría: {str(e)}")


@router.put(
    "/{curaduria_id}",
    response_model=CuraduriaDetailResponse,
    summary="Actualizar curaduría",
    description="Actualizar campos de curaduría existente",
)
def actualizar_curaduria(
    curaduria_id: UUID,
    curaduria_data: CuraduriaUpdate,
    use_case: ActualizarCuraduriaUseCase = Depends(get_actualizar_curaduria_use_case),
):
    """Actualizar curaduría"""
    try:
        curaduria = use_case.execute(
            curaduria_id=curaduria_id,
            ofrece=curaduria_data.ofrece,
            busca=curaduria_data.busca,
            objetivos=curaduria_data.objetivos,
            capacidades=curaduria_data.capacidades,
            notas_internas=curaduria_data.notas_internas,
        )
        return curaduria
    except NotFoundException as e:
        raise NotFoundException(message=e.message, details=e.details)
    except Exception as e:
        raise ValidationException(message=f"Error al actualizar curaduría: {str(e)}")


@router.delete(
    "/{curaduria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar curaduría",
    description="Eliminar curaduría por ID",
)
def eliminar_curaduria(
    curaduria_id: UUID,
    use_case: EliminarCuraduriaUseCase = Depends(get_eliminar_curaduria_use_case),
):
    """Eliminar curaduría"""
    try:
        use_case.execute(curaduria_id=curaduria_id)
    except NotFoundException as e:
        raise NotFoundException(message=e.message, details=e.details)
    except Exception as e:
        raise ValidationException(message=f"Error al eliminar curaduría: {str(e)}")


@router.get(
    "/matches/{empresa_id}",
    response_model=MatchListResponse,
    summary="Calcular matches",
    description="Calcular compatibilidad entre empresa y otras empresas usando algoritmo de scoring",
)
def calcular_matches(
    empresa_id: UUID,
    min_score: int = Query(0, ge=0, description="Score mínimo para incluir match"),
    use_case: CalcularMatchesUseCase = Depends(get_calcular_matches_use_case),
):
    """
    Calcular matches para empresa:
    - +2 puntos si mismo sector
    - +1 punto por keyword match (A ofrece lo que B busca)
    - +1 punto por keyword match (A busca lo que B ofrece)
    """
    try:
        matches = use_case.execute(empresa_id=empresa_id, min_score=min_score)
        return MatchListResponse(matches=matches, total=len(matches))
    except NotFoundException as e:
        raise NotFoundException(message=e.message, details=e.details)
    except Exception as e:
        raise ValidationException(message=f"Error al calcular matches: {str(e)}")
