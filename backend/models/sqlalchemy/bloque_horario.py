from sqlalchemy import Column, Integer, String, Boolean, Date, Time, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class BloqueHorario(Base):
    __tablename__ = "bloques_horarios"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, default=datetime.utcnow().date, index=True)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    duracion_minutos = Column(Integer, nullable=False)
    ubicacion = Column(String(100), nullable=True)
    label = Column(String(50), nullable=True)
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    reuniones = relationship("Reunion", back_populates="bloque")
