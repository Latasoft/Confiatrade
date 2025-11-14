from database import Base
from sqlalchemy import Boolean, Column, Integer, String


class PaisModel(Base):
    __tablename__ = "paises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    codigo = Column(String(3), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

    from sqlalchemy.orm import relationship

    empresas = relationship("EmpresaModel", back_populates="pais")


class SectorModel(Base):
    __tablename__ = "sectores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(500))
    activo = Column(Boolean, default=True)

    from sqlalchemy.orm import relationship

    empresas = relationship("EmpresaModel", back_populates="sector")
