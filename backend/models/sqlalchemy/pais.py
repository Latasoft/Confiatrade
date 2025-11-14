from database import Base
from sqlalchemy import Boolean, Column, Integer, String


class Pais(Base):
    __tablename__ = "paises"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(3), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)
