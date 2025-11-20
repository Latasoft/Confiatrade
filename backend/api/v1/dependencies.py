import models.sqlalchemy  # noqa: F401 - Register all SQLAlchemy models
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
from core.use_cases.curaduria.actualizar_curaduria import ActualizarCuraduriaUseCase
from core.use_cases.curaduria.calcular_matches import CalcularMatchesUseCase
from core.use_cases.curaduria.crear_curaduria import CrearCuraduriaUseCase
from core.use_cases.curaduria.eliminar_curaduria import EliminarCuraduriaUseCase
from core.use_cases.curaduria.listar_curaduria import ListarCuraduriasUseCase
from core.use_cases.curaduria.obtener_curaduria import ObtenerCuraduriaUseCase
from core.use_cases.empresas.create_empresa import CreateEmpresa
from core.use_cases.empresas.get_empresa import GetEmpresa
from core.use_cases.empresas.get_empresas import GetEmpresas
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
from core.use_cases.eventos.create_evento import CreateEventoUseCase
from core.use_cases.eventos.delete_evento import DeleteEventoUseCase
from core.use_cases.eventos.get_all_eventos import GetAllEventosUseCase
from core.use_cases.eventos.get_evento_by_id import GetEventoByIdUseCase
from core.use_cases.eventos.update_evento import UpdateEventoUseCase
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
from core.use_cases.reuniones.actualizar_reunion import ActualizarReunionUseCase
from core.use_cases.reuniones.crear_reunion import CrearReunionUseCase
from core.use_cases.reuniones.eliminar_reunion import EliminarReunionUseCase
from core.use_cases.reuniones.get_all_reuniones import GetAllReunionesUseCase
from core.use_cases.reuniones.get_reunion_by_id import GetReunionByIdUseCase
from database import get_db
from fastapi import Depends
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository
from repositories.postgres.curaduria_repository import CuraduriaRepository
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository
from repositories.postgres.empresa_repository import PostgresEmpresaRepository
from repositories.postgres.evento_repository import EventoRepository
from repositories.postgres.participante_repository import ParticipanteRepository
from repositories.postgres.reunion_repository import ReunionRepository
from sqlalchemy.orm import Session


def get_empresa_repository(db: Session = Depends(get_db)) -> PostgresEmpresaRepository:
    return PostgresEmpresaRepository(db)


def get_empresas_use_case(
    repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> GetEmpresas:
    return GetEmpresas(repository)


def get_empresa_use_case(
    repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> GetEmpresa:
    return GetEmpresa(repository)


def create_empresa_use_case(
    repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> CreateEmpresa:
    return CreateEmpresa(repository)


# === EVENTOS DEPENDENCIES ===


def get_evento_repository(db: Session = Depends(get_db)) -> EventoRepository:
    return EventoRepository(db)


def create_evento_use_case(
    repository: EventoRepository = Depends(get_evento_repository),
) -> CreateEventoUseCase:
    return CreateEventoUseCase(repository)


def get_all_eventos_use_case(
    repository: EventoRepository = Depends(get_evento_repository),
) -> GetAllEventosUseCase:
    return GetAllEventosUseCase(repository)


def get_evento_by_id_use_case(
    repository: EventoRepository = Depends(get_evento_repository),
) -> GetEventoByIdUseCase:
    return GetEventoByIdUseCase(repository)


def update_evento_use_case(
    repository: EventoRepository = Depends(get_evento_repository),
) -> UpdateEventoUseCase:
    return UpdateEventoUseCase(repository)


def delete_evento_use_case(
    repository: EventoRepository = Depends(get_evento_repository),
) -> DeleteEventoUseCase:
    return DeleteEventoUseCase(repository)


# === EMPRESAS-EVENTOS DEPENDENCIES ===


def get_empresa_evento_repository(
    db: Session = Depends(get_db),
) -> EmpresaEventoRepository:
    return EmpresaEventoRepository(db)


def inscribir_empresa_use_case(
    inscripcion_repository: EmpresaEventoRepository = Depends(
        get_empresa_evento_repository
    ),
    empresa_repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
    evento_repository: EventoRepository = Depends(get_evento_repository),
) -> InscribirEmpresaUseCase:
    return InscribirEmpresaUseCase(
        inscripcion_repository, empresa_repository, evento_repository
    )


def aprobar_inscripcion_use_case(
    repository: EmpresaEventoRepository = Depends(get_empresa_evento_repository),
) -> AprobarInscripcionUseCase:
    return AprobarInscripcionUseCase(repository)


def listar_empresas_por_evento_use_case(
    inscripcion_repository: EmpresaEventoRepository = Depends(
        get_empresa_evento_repository
    ),
    evento_repository: EventoRepository = Depends(get_evento_repository),
) -> ListarEmpresasPorEventoUseCase:
    return ListarEmpresasPorEventoUseCase(inscripcion_repository, evento_repository)


def get_all_inscripciones_use_case(
    repository: EmpresaEventoRepository = Depends(get_empresa_evento_repository),
) -> GetAllInscripcionesUseCase:
    return GetAllInscripcionesUseCase(repository)


def cancelar_inscripcion_use_case(
    repository: EmpresaEventoRepository = Depends(get_empresa_evento_repository),
) -> CancelarInscripcionUseCase:
    return CancelarInscripcionUseCase(repository)


# === PARTICIPANTES DEPENDENCIES ===


def get_participante_repository(
    db: Session = Depends(get_db),
) -> ParticipanteRepository:
    return ParticipanteRepository(db)


def crear_participante_use_case(
    participante_repository: ParticipanteRepository = Depends(
        get_participante_repository
    ),
    empresa_repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> CrearParticipanteUseCase:
    return CrearParticipanteUseCase(participante_repository, empresa_repository)


def get_all_participantes_use_case(
    repository: ParticipanteRepository = Depends(get_participante_repository),
) -> GetAllParticipantesUseCase:
    return GetAllParticipantesUseCase(repository)


def get_participante_by_id_use_case(
    repository: ParticipanteRepository = Depends(get_participante_repository),
) -> GetParticipanteByIdUseCase:
    return GetParticipanteByIdUseCase(repository)


def actualizar_participante_use_case(
    repository: ParticipanteRepository = Depends(get_participante_repository),
) -> ActualizarParticipanteUseCase:
    return ActualizarParticipanteUseCase(repository)


def eliminar_participante_use_case(
    repository: ParticipanteRepository = Depends(get_participante_repository),
) -> EliminarParticipanteUseCase:
    return EliminarParticipanteUseCase(repository)


# === BLOQUES HORARIOS DEPENDENCIES ===


def get_bloque_horario_repository(
    db: Session = Depends(get_db),
) -> BloqueHorarioRepository:
    return BloqueHorarioRepository(db)


def crear_bloque_horario_use_case(
    bloque_repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
    evento_repository: EventoRepository = Depends(get_evento_repository),
) -> CrearBloqueHorarioUseCase:
    return CrearBloqueHorarioUseCase(bloque_repository, evento_repository)


def generar_bloques_horarios_use_case(
    bloque_repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
    evento_repository: EventoRepository = Depends(get_evento_repository),
) -> GenerarBloquesHorariosUseCase:
    return GenerarBloquesHorariosUseCase(bloque_repository, evento_repository)


def get_all_bloques_horarios_use_case(
    repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
) -> GetAllBloquesHorariosUseCase:
    return GetAllBloquesHorariosUseCase(repository)


def get_bloque_horario_by_id_use_case(
    repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
) -> GetBloqueHorarioByIdUseCase:
    return GetBloqueHorarioByIdUseCase(repository)


def actualizar_bloque_horario_use_case(
    repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
) -> ActualizarBloqueHorarioUseCase:
    return ActualizarBloqueHorarioUseCase(repository)


def eliminar_bloque_horario_use_case(
    repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
) -> EliminarBloqueHorarioUseCase:
    return EliminarBloqueHorarioUseCase(repository)


# === REUNIONES DEPENDENCIES ===


def get_reunion_repository(
    db: Session = Depends(get_db),
) -> ReunionRepository:
    return ReunionRepository(db)


def crear_reunion_use_case(
    reunion_repository: ReunionRepository = Depends(get_reunion_repository),
    empresa_repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
    bloque_repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
    empresa_evento_repository: EmpresaEventoRepository = Depends(
        get_empresa_evento_repository
    ),
) -> CrearReunionUseCase:
    return CrearReunionUseCase(
        reunion_repository,
        empresa_repository,
        bloque_repository,
        empresa_evento_repository,
    )


def get_all_reuniones_use_case(
    repository: ReunionRepository = Depends(get_reunion_repository),
) -> GetAllReunionesUseCase:
    return GetAllReunionesUseCase(repository)


def get_reunion_by_id_use_case(
    repository: ReunionRepository = Depends(get_reunion_repository),
) -> GetReunionByIdUseCase:
    return GetReunionByIdUseCase(repository)


def actualizar_reunion_use_case(
    repository: ReunionRepository = Depends(get_reunion_repository),
) -> ActualizarReunionUseCase:
    return ActualizarReunionUseCase(repository)


def eliminar_reunion_use_case(
    repository: ReunionRepository = Depends(get_reunion_repository),
    bloque_repository: BloqueHorarioRepository = Depends(get_bloque_horario_repository),
) -> EliminarReunionUseCase:
    return EliminarReunionUseCase(repository, bloque_repository)


# === CURADURÍA DEPENDENCIES ===


def get_curaduria_repository(
    db: Session = Depends(get_db),
) -> CuraduriaRepository:
    return CuraduriaRepository(db)


def get_crear_curaduria_use_case(
    curaduria_repository: CuraduriaRepository = Depends(get_curaduria_repository),
    empresa_repository: PostgresEmpresaRepository = Depends(get_empresa_repository),
) -> CrearCuraduriaUseCase:
    return CrearCuraduriaUseCase(curaduria_repository, empresa_repository)


def get_obtener_curaduria_use_case(
    repository: CuraduriaRepository = Depends(get_curaduria_repository),
) -> ObtenerCuraduriaUseCase:
    return ObtenerCuraduriaUseCase(repository)


def get_listar_curaduria_use_case(
    repository: CuraduriaRepository = Depends(get_curaduria_repository),
) -> ListarCuraduriasUseCase:
    return ListarCuraduriasUseCase(repository)


def get_actualizar_curaduria_use_case(
    repository: CuraduriaRepository = Depends(get_curaduria_repository),
) -> ActualizarCuraduriaUseCase:
    return ActualizarCuraduriaUseCase(repository)


def get_eliminar_curaduria_use_case(
    repository: CuraduriaRepository = Depends(get_curaduria_repository),
) -> EliminarCuraduriaUseCase:
    return EliminarCuraduriaUseCase(repository)


def get_calcular_matches_use_case(
    repository: CuraduriaRepository = Depends(get_curaduria_repository),
) -> CalcularMatchesUseCase:
    return CalcularMatchesUseCase(repository)
