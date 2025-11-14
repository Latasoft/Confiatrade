from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class Pais(Base):
    __tablename__ = "paises"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(3), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)
