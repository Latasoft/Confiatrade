from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Date, Time, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class BloqueHorarioModel(Base):
    __tablename__ = "bloques_horarios"

    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(UUID(as_uuid=True), ForeignKey("eventos.id"), nullable=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    duracion_minutos = Column(Integer, nullable=False)
    ubicacion = Column(String(100), nullable=True)
    label = Column(String(50), nullable=True)
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evento = relationship("EventoModel", back_populates="bloques_horarios")
    reuniones = relationship("ReunionModel", back_populates="bloque")
