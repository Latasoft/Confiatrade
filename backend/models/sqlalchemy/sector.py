from sqlalchemy import Column, Integer, String, Text, Boolean
from database import Base

class Sector(Base):
    __tablename__ = "sectores"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True)
