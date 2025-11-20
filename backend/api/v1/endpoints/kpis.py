"""Endpoints para KPIs y métricas"""

from database import get_db
from fastapi import APIRouter, Depends
from models.sqlalchemy.bloque_horario_model import BloqueHorarioModel
from models.sqlalchemy.empresa import EmpresaModel
from models.sqlalchemy.evento_model import EventoModel
from models.sqlalchemy.participante import ParticipanteModel
from models.sqlalchemy.reunion_model import ReunionModel
from models.sqlalchemy.seguimiento_model import SeguimientoModel
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/current")
def get_current_kpis(db: Session = Depends(get_db)):
    """Obtener KPIs actuales del sistema"""

    # KPIs de Empresas
    total_empresas = db.query(EmpresaModel).count()
    empresas_aprobadas = (
        db.query(EmpresaModel).filter(EmpresaModel.aprobada.is_(True)).count()
    )

    # KPIs de Eventos
    total_eventos = db.query(EventoModel).filter(EventoModel.activo.is_(True)).count()
    eventos_activos = (
        db.query(EventoModel)
        .filter(
            and_(
                EventoModel.activo.is_(True),
                EventoModel.estado.in_(["inscripcion_abierta", "en_curso"]),
            )
        )
        .count()
    )

    # KPIs de Reuniones
    total_reuniones = db.query(ReunionModel).count()
    reuniones_confirmadas = (
        db.query(ReunionModel).filter(ReunionModel.estado == "confirmada").count()
    )
    reuniones_realizadas = (
        db.query(ReunionModel).filter(ReunionModel.estado == "realizada").count()
    )
    reuniones_canceladas = (
        db.query(ReunionModel).filter(ReunionModel.estado == "cancelada").count()
    )

    # Tasa de realización
    tasa_realizacion = (
        (reuniones_realizadas / total_reuniones * 100) if total_reuniones > 0 else 0
    )

    # KPIs de Bloques Horarios
    total_bloques = db.query(BloqueHorarioModel).count()
    bloques_ocupados = (
        db.query(BloqueHorarioModel)
        .filter(BloqueHorarioModel.disponible.is_(False))
        .count()
    )
    tasa_ocupacion = (
        (bloques_ocupados / total_bloques * 100) if total_bloques > 0 else 0
    )

    # KPIs de Seguimiento
    total_seguimientos = db.query(SeguimientoModel).count()
    acuerdos_cerrados = (
        db.query(SeguimientoModel)
        .filter(SeguimientoModel.resultado == "acuerdo_cerrado")
        .count()
    )
    lois_firmadas = (
        db.query(SeguimientoModel)
        .filter(SeguimientoModel.resultado == "loi_firmada")
        .count()
    )

    # Monto total estimado (suma de montos en seguimientos con acuerdos)
    monto_query = (
        db.query(func.sum(SeguimientoModel.monto_estimado))
        .filter(SeguimientoModel.resultado.in_(["acuerdo_cerrado", "loi_firmada"]))
        .scalar()
    )
    monto_total_estimado = float(monto_query) if monto_query else 0

    # KPIs de Participantes
    total_participantes = db.query(ParticipanteModel).count()
    participantes_checkin = (
        db.query(ParticipanteModel)
        .filter(ParticipanteModel.check_in_realizado.is_(True))
        .count()
    )

    # Calcular tasa de inscripción (empresas con participantes)
    empresas_con_participantes = (
        db.query(ParticipanteModel.empresa_id).distinct().count()
    )
    tasa_inscripcion = (
        (empresas_con_participantes / total_empresas * 100) if total_empresas > 0 else 0
    )

    # Meta de empresas (puedes ajustar esta lógica según tu necesidad)
    meta_empresas = total_empresas + 10  # Meta simple: 10 más que el total actual

    return {
        "kpis": {
            # Empresas
            "total_empresas": total_empresas,
            "meta_empresas": meta_empresas,
            "empresas_inscritas": empresas_con_participantes,
            "empresas_aprobadas": empresas_aprobadas,
            "empresas_pendientes": total_empresas - empresas_aprobadas,
            "tasa_inscripcion": round(tasa_inscripcion, 2),
            "tasa_aprobacion": (empresas_aprobadas / total_empresas * 100)
            if total_empresas > 0
            else 0,
            # Eventos
            "total_eventos": total_eventos,
            "eventos_activos": eventos_activos,
            # Reuniones
            "total_reuniones": total_reuniones,
            "reuniones_programadas": reuniones_confirmadas,  # Alias para compatibilidad
            "reuniones_confirmadas": reuniones_confirmadas,
            "reuniones_realizadas": reuniones_realizadas,
            "reuniones_canceladas": reuniones_canceladas,
            "tasa_realizacion": round(tasa_realizacion, 2),
            # Bloques
            "total_bloques": total_bloques,
            "bloques_ocupados": bloques_ocupados,
            "bloques_disponibles": total_bloques - bloques_ocupados,
            "tasa_ocupacion": round(tasa_ocupacion, 2),
            # Seguimientos
            "total_seguimientos": total_seguimientos,
            "acuerdos_cerrados": acuerdos_cerrados,
            "lois_firmadas": lois_firmadas,
            "monto_total_estimado": monto_total_estimado,
            # Participantes
            "total_participantes": total_participantes,
            "participantes_checkin": participantes_checkin,
            "tasa_checkin": (participantes_checkin / total_participantes * 100)
            if total_participantes > 0
            else 0,
        }
    }
