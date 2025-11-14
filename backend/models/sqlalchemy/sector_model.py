from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class SectorModel(Base):
    __tablename__ = "sectores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True)

    empresas = relationship("EmpresaModel", back_populates="sector")
