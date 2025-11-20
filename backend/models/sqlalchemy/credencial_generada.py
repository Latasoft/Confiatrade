import uuid
from datetime import datetime

from database import Base

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class CredencialGeneradaModel(Base):
    __tablename__ = "credenciales_generadas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # FK a empresa (nullable porque puede ser participante)
    empresa_id = Column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # FK a participante (nullable porque puede ser empresa)
    participante_id = Column(
        UUID(as_uuid=True),
        ForeignKey("participantes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # Tipo de credencial: 'empresa' o 'participante'
    tipo = Column(String(20), nullable=False, index=True)

    # Fecha de generación
    fecha_generacion = Column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )

    # Usuario que generó (admin, opcional)
    generada_por = Column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Hash del PDF para verificación
    pdf_hash = Column(String(64), nullable=True)

    # Formato: 'badge', 'lanyard', 'card'
    formato = Column(String(20), default="badge")

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    empresa = relationship("EmpresaModel", back_populates="credenciales_generadas")
    participante = relationship(
        "ParticipanteModel", back_populates="credenciales_generadas"
    )
    usuario = relationship("UsuarioModel", foreign_keys=[generada_por])
