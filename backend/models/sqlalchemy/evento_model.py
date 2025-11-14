import uuid
from datetime import datetime

from database import Base
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class EventoModel(Base):
    __tablename__ = "eventos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    pais_sede_id = Column(Integer, nullable=True)
    ciudad_sede = Column(String(100), nullable=True)
    fecha_inicio = Column(Date, nullable=False, index=True)
    fecha_fin = Column(Date, nullable=False)
    tipo = Column(String(50), default="encuentro_empresarial")
    estado = Column(String(50), default="planificacion", index=True)
    capacidad_empresas = Column(Integer, nullable=True)
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    empresas = relationship("EmpresaEventoModel", back_populates="evento")
    bloques_horarios = relationship("BloqueHorarioModel", back_populates="evento")
