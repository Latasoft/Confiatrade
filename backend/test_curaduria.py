"""Test script: Crear curadurías y probar matching"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from database import get_db
from repositories.postgres.curaduria_repository import CuraduriaRepository
from repositories.postgres.empresa_repository import PostgresEmpresaRepository


async def test_crear_curaduria():
    """Crear 3 curadurías con diferentes características para testing"""
    db = next(get_db())
    curaduria_repo = CuraduriaRepository(db)
    empresa_repo = PostgresEmpresaRepository(db)

    # Get empresas existentes
    empresas = empresa_repo.get_all(skip=0, limit=10)
    print(f"\n📊 Empresas disponibles: {len(empresas)}")
    for empresa in empresas:
        print(f"   - {empresa.nombre} (ID: {empresa.id})")

    if len(empresas) < 3:
        print("\n❌ Se necesitan al menos 3 empresas. Ejecuta el seed primero.")
        return

    # Curaduría 1: Transportes Chile (sector_id: Transporte)
    print("\n1️⃣ Creando curaduría para Transportes Chile...")
    curaduria1 = curaduria_repo.create(
        empresa_id=empresas[0].id,
        ofrece="logística internacional, transporte terrestre, almacenamiento, distribución",
        busca="software de gestión, tecnología de tracking, soluciones de pago digital",
        objetivos="Expandir operaciones a Brasil y Argentina",
        capacidades="Flota de 50 camiones, 3 centros de distribución",
        notas_internas="Cliente premium - priorizar matches tecnológicos",
    )
    print(f"   ✅ Curaduría creada: {curaduria1.id}")

    # Curaduría 2: Tech Solutions Brasil (sector_id: Tecnología)
    print("\n2️⃣ Creando curaduría para Tech Solutions Brasil...")
    curaduria2 = curaduria_repo.create(
        empresa_id=empresas[1].id,
        ofrece="software de gestión, tracking GPS, aplicaciones móviles, blockchain",
        busca="clientes en logística, transporte terrestre, distribución",
        objetivos="Penetrar mercado de transporte y logística",
        capacidades="Equipo de 20 desarrolladores, oficinas en SP y RJ",
        notas_internas="Startup en crecimiento - buscan partners estratégicos",
    )
    print(f"   ✅ Curaduría creada: {curaduria2.id}")

    # Curaduría 3: Energia Renovable ARG (sector_id: Energía)
    print("\n3️⃣ Creando curaduría para Energia Renovable ARG...")
    curaduria3 = curaduria_repo.create(
        empresa_id=empresas[2].id,
        ofrece="paneles solares, instalación, mantenimiento, consultoría energética",
        busca="clientes industriales, soluciones de tracking, software de gestión",
        objetivos="Expandir a mercado industrial",
        capacidades="100+ instalaciones realizadas, certificación ISO",
        notas_internas="Interes en digitalización de operaciones",
    )
    print(f"   ✅ Curaduría creada: {curaduria3.id}")

    print("\n✅ CURADURÍAS CREADAS EXITOSAMENTE")
    print("\nAnálisis de matches esperados:")
    print("🔗 Transportes ↔ Tech Solutions:")
    print(
        "   - Keywords: transportes ofrece 'transporte terrestre, logística' + Tech busca 'transporte, logística' = +2 puntos"
    )
    print(
        "   - Keywords: transportes busca 'software de gestión, tracking' + Tech ofrece 'software de gestión, tracking GPS' = +2 puntos"
    )
    print("   - Sectores diferentes = 0 puntos")
    print("   - SCORE ESPERADO: 4 puntos")

    print("\n🔗 Transportes ↔ Energia:")
    print(
        "   - Keywords: transportes busca 'software de gestión' + Energia ofrece = 0 puntos (no match)"
    )
    print(
        "   - Keywords: energia busca 'software de gestión, tracking' + transportes ofrece = 0 puntos (no match directo)"
    )
    print("   - Sectores diferentes = 0 puntos")
    print("   - SCORE ESPERADO: 0 puntos")

    print("\n🔗 Tech Solutions ↔ Energia:")
    print(
        "   - Keywords: tech ofrece 'software de gestión, tracking' + energia busca 'software de gestión, tracking' = +2 puntos"
    )
    print("   - Keywords: tech busca = 0 puntos (no match)")
    print("   - Sectores diferentes = 0 puntos")
    print("   - SCORE ESPERADO: 2 puntos")


if __name__ == "__main__":
    asyncio.run(test_crear_curaduria())
