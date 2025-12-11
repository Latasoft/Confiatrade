import uuid
from datetime import datetime

from database import Base

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nombre_completo = Column(String(255), nullable=True)
    rol = Column(
        String(50), default="empresa", index=True
    )  # Mantener por compatibilidad
    rol_id = Column(
        UUID(as_uuid=True), ForeignKey("roles.id"), nullable=True, index=True
    )  # Nuevo sistema de roles
    empresa_id = Column(
        UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=True, index=True
    )
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    empresa = relationship("EmpresaModel", backref="usuarios")
    rol_asignado = relationship("RolModel", back_populates="usuarios")
