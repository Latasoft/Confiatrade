import uuid
from datetime import datetime

from database import Base
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ReunionModel(Base):
    __tablename__ = "reuniones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    bloque_id = Column(
        Integer, ForeignKey("bloques_horarios.id"), nullable=False, index=True
    )
    empresa_a_id = Column(
        UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=False, index=True
    )
    empresa_b_id = Column(
        UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=False, index=True
    )
    estado = Column(String(50), default="programada", index=True)
    notas = Column(Text, nullable=True)
    requiere_interprete = Column(Boolean, default=False)
    sala = Column(String(50), nullable=True)
    resultado = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("empresa_a_id != empresa_b_id", name="empresas_distintas"),
        UniqueConstraint("bloque_id", "empresa_a_id", name="reunion_bloque_unique"),
        UniqueConstraint("bloque_id", "empresa_b_id", name="reunion_bloque_unique_b"),
    )

    bloque = relationship("BloqueHorarioModel", back_populates="reuniones")
    empresa_a = relationship(
        "EmpresaModel", foreign_keys=[empresa_a_id], back_populates="reuniones_a"
    )
    empresa_b = relationship(
        "EmpresaModel", foreign_keys=[empresa_b_id], back_populates="reuniones_b"
    )
