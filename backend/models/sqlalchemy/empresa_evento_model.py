import uuid
from datetime import datetime

from database import Base
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class EmpresaEventoModel(Base):
    __tablename__ = "empresas_eventos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    empresa_id = Column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    evento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("eventos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    aprobada = Column(Boolean, default=False, index=True)
    fecha_inscripcion = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("empresa_id", "evento_id", name="empresa_evento_unique"),
    )

    empresa = relationship("EmpresaModel", back_populates="eventos")
    evento = relationship("EventoModel", back_populates="empresas")
