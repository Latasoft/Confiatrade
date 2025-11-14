from sqlalchemy import Column, Integer, Date, DateTime, Numeric, UniqueConstraint
from datetime import datetime
from database import Base

class KPI(Base):
    __tablename__ = "kpis"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, default=datetime.utcnow().date, index=True)
    empresas_meta = Column(Integer, default=100)
    empresas_actual = Column(Integer, default=0)
    reuniones_meta = Column(Integer, default=300)
    reuniones_actual = Column(Integer, default=0)
    acuerdos_meta = Column(Integer, default=20)
    acuerdos_actual = Column(Integer, default=0)
    satisfaccion_meta = Column(Numeric(5, 2), default=80.0)
    satisfaccion_actual = Column(Numeric(5, 2), default=0.0)
    ocupacion_agenda = Column(Numeric(5, 2), default=0.0)
    puntualidad = Column(Numeric(5, 2), default=0.0)
    nps = Column(Numeric(5, 2), default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('fecha', name='kpis_fecha_unique'),
    )
