"""Script para probar inscripciones de empresas a eventos"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import models.sqlalchemy  # noqa: F401
from database import SessionLocal
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository
from repositories.postgres.empresa_repository import PostgresEmpresaRepository
from repositories.postgres.evento_repository import EventoRepository


def test_inscripciones():
    db = SessionLocal()
    try:
        evento_repo = EventoRepository(db)
        empresa_repo = PostgresEmpresaRepository(db)
        inscripcion_repo = EmpresaEventoRepository(db)

        print("🔍 Probando sistema de inscripciones...\n")

        # 1. Obtener eventos disponibles
        print("1. Eventos disponibles:")
        eventos = evento_repo.get_all(limit=5)
        if not eventos:
            print("   ⚠️  No hay eventos. Ejecuta primero test_create_evento.py")
            return

        evento = eventos[0]
        print(f"   - {evento.nombre} (ID: {evento.id})")

        # 2. Obtener empresas disponibles
        print("\n2. Empresas disponibles:")
        empresas = empresa_repo.get_all(limit=5)
        if not empresas:
            print("   ⚠️  No hay empresas. Crea una empresa primero.")
            return

        for empresa in empresas[:3]:
            print(f"   - {empresa.nombre} (ID: {empresa.id})")

        # 3. Inscribir primera empresa
        print(f"\n3. Inscribiendo empresa '{empresas[0].nombre}' al evento...")
        inscripcion_data = {"empresa_id": empresas[0].id, "evento_id": evento.id}

        # Verificar si ya está inscrita
        existente = inscripcion_repo.get_by_empresa_evento(empresas[0].id, evento.id)

        if existente:
            print(f"   ℹ️  Ya inscrita (ID: {existente.id})")
            inscripcion = existente
        else:
            inscripcion = inscripcion_repo.create(inscripcion_data)
            print(
                f"   ✓ Inscrita (ID: {inscripcion.id}, Aprobada: {inscripcion.aprobada})"
            )

        # 4. Listar inscripciones del evento
        print(f"\n4. Inscripciones en '{evento.nombre}':")
        inscripciones = inscripcion_repo.get_empresas_by_evento(evento.id)
        for insc in inscripciones:
            estado = "✓ Aprobada" if insc.aprobada else "⏳ Pendiente"
            print(f"   - {insc.empresa.nombre}: {estado}")

        # 5. Estadísticas
        print("\n5. Estadísticas:")
        print(f"   Total: {inscripcion_repo.count_total(evento.id)}")
        print(f"   Aprobadas: {inscripcion_repo.count_aprobadas(evento.id)}")
        print(f"   Pendientes: {inscripcion_repo.count_pendientes(evento.id)}")

        print("\n✅ Prueba completada!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_inscripciones()
