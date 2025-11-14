from database import Base
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship


class PaisModel(Base):
    __tablename__ = "paises"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(3), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)

    empresas = relationship("EmpresaModel", back_populates="pais")
