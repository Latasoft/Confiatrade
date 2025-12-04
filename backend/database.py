from config import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración optimizada del pool de conexiones para Supabase
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,  # Número de conexiones permanentes
    max_overflow=10,  # Conexiones adicionales bajo demanda
    pool_timeout=30,  # Segundos antes de timeout esperando conexión
    pool_recycle=1800,  # Reciclar conexiones cada 30 minutos
    pool_pre_ping=True,  # Verificar conexión antes de usar (evita conexiones muertas)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
