"""Import all SQLAlchemy models to ensure they are registered"""

# Modelos principales
# Modelos de gestión de eventos
from models.sqlalchemy.bloque_horario_model import BloqueHorarioModel

# Módulos adicionales
from models.sqlalchemy.curaduria_model import CuraduriaModel
from models.sqlalchemy.empresa import EmpresaModel

# Modelos de relación
from models.sqlalchemy.empresa_evento_model import EmpresaEventoModel
from models.sqlalchemy.evento_model import EventoModel
from models.sqlalchemy.kpi_model import KPIModel
from models.sqlalchemy.mesa_tematica_model import MesaTematicaModel
from models.sqlalchemy.nda_model import NDAModel

# Modelos de catálogo
from models.sqlalchemy.pais_model import PaisModel
from models.sqlalchemy.participante import ParticipanteModel
from models.sqlalchemy.reunion_model import ReunionModel
from models.sqlalchemy.ruta_turistica_model import RutaTuristicaModel
from models.sqlalchemy.sector_model import SectorModel
from models.sqlalchemy.seguimiento_model import SeguimientoModel
from models.sqlalchemy.usuario_model import UsuarioModel

__all__ = [
    "EmpresaModel",
    "EventoModel",
    "UsuarioModel",
    "ParticipanteModel",
    "EmpresaEventoModel",
    "PaisModel",
    "SectorModel",
    "BloqueHorarioModel",
    "ReunionModel",
    "CuraduriaModel",
    "SeguimientoModel",
    "KPIModel",
    "NDAModel",
    "MesaTematicaModel",
    "RutaTuristicaModel",
]
