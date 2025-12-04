from config import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración optimizada del pool de conexiones
# Ajusta estos valores según el pool_size configurado en Supabase
# Recomendado: Supabase pool_size = 50, Backend total = 25-30 (deja margen)
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=15,  # 15 conexiones permanentes
    max_overflow=10,  # 10 adicionales bajo demanda (total: 25)
    pool_timeout=30,  # Timeout de 30s esperando conexión
    pool_recycle=1800,  # Reciclar conexiones cada 30 minutos
    pool_pre_ping=True,  # Verificar conexión antes de usar (evita conexiones muertas)
    echo_pool=False,  # Desactivar logs del pool en producción
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
