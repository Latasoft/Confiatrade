import uuid
from datetime import datetime

from database import Base

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class ParticipanteModel(Base):
    __tablename__ = "participantes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    empresa_id = Column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    nombre_completo = Column(String(255), nullable=False)
    cargo = Column(String(150), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    telefono = Column(String(50), nullable=True)
    idioma = Column(String(2), default="ES")
    requiere_interprete = Column(Boolean, default=False)
    foto_url = Column(String(500), nullable=True)
    qr_data = Column(Text, nullable=True)
    check_in_realizado = Column(Boolean, default=False, index=True)
    fecha_check_in = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("empresa_id", "email", name="email_unique_per_empresa"),
    )

    empresa = relationship("EmpresaModel", back_populates="participantes")
    credenciales_generadas = relationship(
        "CredencialGeneradaModel",
        back_populates="participante",
        cascade="all, delete-orphan",
    )
