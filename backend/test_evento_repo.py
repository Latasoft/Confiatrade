"""Script para probar la conexión a la base de datos y el repository de eventos"""

import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Importar todos los modelos para que SQLAlchemy los registre
import models.sqlalchemy  # noqa: F401 - Imports all models
from database import SessionLocal
from repositories.postgres.evento_repository import EventoRepository


def test_eventos():
    db = SessionLocal()
    try:
        repo = EventoRepository(db)

        print("🔍 Probando EventoRepository...")

        # Test 1: Contar eventos
        print("\n1. Contando eventos totales...")
        total = repo.count_total()
        print(f"   ✓ Total eventos: {total}")

        # Test 2: Obtener todos los eventos
        print("\n2. Obteniendo lista de eventos...")
        eventos = repo.get_all(skip=0, limit=10)
        print(f"   ✓ Eventos obtenidos: {len(eventos)}")

        for evento in eventos:
            print(f"     - {evento.nombre} ({evento.estado})")

        print("\n✅ Todas las pruebas pasaron!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_eventos()
