import uuid
from datetime import datetime

from database import Base
from sqlalchemy import ARRAY, Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class Seguimiento(Base):
    __tablename__ = "seguimiento"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    empresa_id = Column(
        UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=False, index=True
    )
    tipo = Column(String(50), default="seguimiento", index=True)
    descripcion = Column(Text, nullable=False)
    responsable = Column(String(255), nullable=True)
    fecha_compromiso = Column(Date, nullable=True)
    estado = Column(String(50), default="pendiente", index=True)
    documentos_url = Column(ARRAY(Text), nullable=True)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="seguimientos")
