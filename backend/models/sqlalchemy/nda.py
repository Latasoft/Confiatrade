from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class NDA(Base):
    __tablename__ = "ndas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=False, index=True)
    tipo = Column(String(50), default="unilateral", index=True)
    firmada = Column(Boolean, default=False, index=True)
    fecha_firma = Column(Date, nullable=True)
    documento_url = Column(String(500), nullable=True)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    empresa = relationship("Empresa", back_populates="ndas")
