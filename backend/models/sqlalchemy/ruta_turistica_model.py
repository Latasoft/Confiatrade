import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Date, Time, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class RutaTuristicaModel(Base):
    __tablename__ = "rutas_turisticas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha = Column(Date, nullable=True)
    hora_salida = Column(Time, nullable=True)
    hora_regreso = Column(Time, nullable=True)
    capacidad_maxima = Column(Numeric(10, 0), nullable=True)
    ubicacion_salida = Column(String(255), nullable=True)
    incluye = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
