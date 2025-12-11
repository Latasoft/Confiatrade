"""
Modelo SQLAlchemy para la tabla de roles
"""

import uuid
from datetime import datetime

from database import Base

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Table, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# Tabla intermedia para la relación many-to-many entre roles y permisos
roles_permisos = Table(
    "roles_permisos",
    Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column(
        "rol_id",
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    Column(
        "permiso_id",
        UUID(as_uuid=True),
        ForeignKey("permisos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    Column("created_at", DateTime, default=datetime.utcnow),
)


class RolModel(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre = Column(String(100), unique=True, nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    es_sistema = Column(Boolean, default=False)  # Roles del sistema no eliminables
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    usuarios = relationship("UsuarioModel", back_populates="rol_asignado")
    permisos = relationship(
        "PermisoModel", secondary=roles_permisos, back_populates="roles"
    )
