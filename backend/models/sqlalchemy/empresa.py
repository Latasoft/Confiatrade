import uuid
from datetime import datetime

from database import Base

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship


class EmpresaModel(Base):
    __tablename__ = "empresas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre = Column(String(255), nullable=False)
    pais_id = Column(Integer, ForeignKey("paises.id"), nullable=False, index=True)
    sector_id = Column(Integer, ForeignKey("sectores.id"), nullable=False, index=True)
    descripcion = Column(Text)
    sitio_web = Column(String(255))
    telefono = Column(String(50))
    email = Column(String(255))
    direccion = Column(Text)
    logo_url = Column(String(500))
    presentacion_url = Column(String(500))
    aprobada = Column(Boolean, default=False, index=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pais = relationship("PaisModel", back_populates="empresas")
    sector = relationship("SectorModel", back_populates="empresas")
    participantes = relationship(
        "ParticipanteModel", back_populates="empresa", cascade="all, delete-orphan"
    )
    curaduria = relationship(
        "CuraduriaModel",
        back_populates="empresa",
        uselist=False,
        cascade="all, delete-orphan",
    )
    reuniones_a = relationship(
        "ReunionModel",
        foreign_keys="ReunionModel.empresa_a_id",
        back_populates="empresa_a",
    )
    reuniones_b = relationship(
        "ReunionModel",
        foreign_keys="ReunionModel.empresa_b_id",
        back_populates="empresa_b",
    )
    seguimientos = relationship(
        "SeguimientoModel", back_populates="empresa", cascade="all, delete-orphan"
    )
    credenciales_generadas = relationship(
        "CredencialGeneradaModel",
        back_populates="empresa",
        cascade="all, delete-orphan",
    )
    ndas = relationship(
        "NDAModel", back_populates="empresa", cascade="all, delete-orphan"
    )
    eventos = relationship(
        "EmpresaEventoModel", back_populates="empresa", cascade="all, delete-orphan"
    )

    @property
    def pais_nombre(self) -> str | None:
        """Retorna el nombre del país de la empresa."""
        return self.pais.nombre if self.pais else None

    @property
    def sector_nombre(self) -> str | None:
        """Retorna el nombre del sector de la empresa."""
        return self.sector.nombre if self.sector else None
