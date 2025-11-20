"""Script para probar la creación de un evento"""

import sys
from datetime import date
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import models.sqlalchemy  # noqa: F401
from database import SessionLocal
from repositories.postgres.evento_repository import EventoRepository


def test_create_evento():
    db = SessionLocal()
    try:
        repo = EventoRepository(db)

        print("🔍 Probando creación de evento...")

        evento_data = {
            "nombre": "Encuentro Empresarial Chile 2025",
            "ciudad_sede": "Santiago",
            "pais_sede": "Chile",
            "fecha_inicio": date(2025, 12, 1),
            "fecha_fin": date(2025, 12, 3),
            "tipo": "B2B",
            "descripcion": "Primer evento de prueba",
            "capacidad_empresas": 50,
            "estado": "planificacion",
            "activo": True,
        }

        evento = repo.create(evento_data)
        print("\n✅ Evento creado exitosamente!")
        print(f"   ID: {evento.id}")
        print(f"   Nombre: {evento.nombre}")
        print(f"   Estado: {evento.estado}")
        print(f"   Activo: {evento.activo}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_create_evento()
