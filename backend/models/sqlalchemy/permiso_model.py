"""
Modelo SQLAlchemy para la tabla de permisos
"""

import uuid
from datetime import datetime

from database import Base

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class PermisoModel(Base):
    __tablename__ = "permisos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    modulo = Column(
        String(50), nullable=False, index=True
    )  # empresas, eventos, reuniones, etc.
    accion = Column(
        String(50), nullable=False, index=True
    )  # ver, crear, editar, eliminar, etc.
    recurso = Column(String(100), nullable=True)  # Recurso específico (opcional)
    activo = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - Importar desde rol_model
    from models.sqlalchemy.rol_model import roles_permisos

    roles = relationship(
        "RolModel", secondary=roles_permisos, back_populates="permisos"
    )
