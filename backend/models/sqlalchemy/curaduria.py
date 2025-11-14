import uuid
from datetime import datetime

from database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class Curaduria(Base):
    __tablename__ = "curaduria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    empresa_id = Column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ofrece = Column(Text, nullable=True)
    busca = Column(Text, nullable=True)
    objetivos = Column(Text, nullable=True)
    capacidades = Column(Text, nullable=True)
    notas_internas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (UniqueConstraint("empresa_id", name="curaduria_empresa_unique"),)

    empresa = relationship("Empresa", back_populates="curaduria")
