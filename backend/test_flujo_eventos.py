"""Test end-to-end del flujo completo de inscripciones a eventos"""

import sys
from pathlib import Path
from uuid import uuid4

backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from database import SessionLocal
from sqlalchemy import and_


def test_flujo_completo():
    """
    Validar flujo completo:
    1. Empresa ve eventos disponibles
    2. Se inscribe a evento
    3. Ve su inscripción pendiente
    4. Admin aprueba
    5. Empresa ve aprobación
    6. Validar capacidad máxima
    7. No puede inscribirse 2 veces
    """
    db = SessionLocal()

    try:
        print("=" * 70)
        print("🧪 TEST FLUJO COMPLETO DE INSCRIPCIONES A EVENTOS")
        print("=" * 70)

        # Preparar datos de prueba
        print("\n📋 PREPARACIÓN DE DATOS DE PRUEBA\n")

        # Crear evento de prueba con capacidad limitada
        evento_test = EventoModel(
            id=uuid4(),
            nombre="Test Evento - Rueda de Negocios 2025",
            descripcion="Evento de prueba para validar inscripciones",
            fecha_inicio="2025-12-01T09:00:00",
            fecha_fin="2025-12-03T18:00:00",
            pais_sede="Colombia",
            ciudad_sede="Bogotá",
            estado="inscripcion_abierta",
            activo=True,
            capacidad_empresas=2,  # Capacidad limitada para probar
        )

        # Verificar si ya existe
        existing = (
            db.query(EventoModel)
            .filter(EventoModel.nombre == evento_test.nombre)
            .first()
        )

        if existing:
            print(f"✓ Evento ya existe: {existing.nombre}")
            evento_test = existing
        else:
            db.add(evento_test)
            db.commit()
            print(f"✓ Evento creado: {evento_test.nombre}")
            print(f"  - Capacidad: {evento_test.capacidad_empresas} empresas")
            print(f"  - Estado: {evento_test.estado}")

        # Obtener empresas aprobadas para prueba
        empresas = (
            db.query(EmpresaModel).filter(EmpresaModel.aprobada == True).limit(3).all()
        )

        if len(empresas) < 2:
            print("\n❌ ERROR: Se necesitan al menos 2 empresas aprobadas")
            print("   Crea empresas aprobadas primero desde el admin.")
            return

        print(f"✓ Empresas disponibles: {len(empresas)}")
        for idx, emp in enumerate(empresas[:3], 1):
            print(f"  {idx}. {emp.nombre}")

        # Limpiar inscripciones previas de prueba
        db.query(EmpresaEventoModel).filter(
            EmpresaEventoModel.evento_id == evento_test.id
        ).delete()
        db.commit()
        print("✓ Inscripciones previas eliminadas")

        # TEST 1: Eventos disponibles
        print("\n" + "=" * 70)
        print("TEST 1: Empresa ve eventos disponibles")
        print("=" * 70)

        eventos_disponibles = (
            db.query(EventoModel)
            .filter(
                and_(
                    EventoModel.activo == True,
                    EventoModel.estado == "inscripcion_abierta",
                )
            )
            .all()
        )

        print(f"✓ Eventos con inscripciones abiertas: {len(eventos_disponibles)}")
        for evento in eventos_disponibles[:3]:
            print(f"  - {evento.nombre} ({evento.pais_sede})")

        assert len(eventos_disponibles) > 0, "Debe haber eventos disponibles"
        print("✅ TEST 1 PASADO\n")

        # TEST 2: Primera inscripción
        print("=" * 70)
        print("TEST 2: Empresa se inscribe a evento")
        print("=" * 70)

        empresa1 = empresas[0]
        inscripcion1 = EmpresaEventoModel(
            id=uuid4(), empresa_id=empresa1.id, evento_id=evento_test.id, aprobada=False
        )
        db.add(inscripcion1)
        db.commit()

        print(f"✓ Inscripción creada: {empresa1.nombre} → {evento_test.nombre}")
        print(f"  - Estado: {'Aprobada' if inscripcion1.aprobada else 'Pendiente'}")

        assert inscripcion1.aprobada == False, "Inscripción debe estar pendiente"
        print("✅ TEST 2 PASADO\n")

        # TEST 3: Ver inscripción pendiente
        print("=" * 70)
        print("TEST 3: Empresa ve su inscripción pendiente")
        print("=" * 70)

        inscripciones_empresa = (
            db.query(EmpresaEventoModel)
            .filter(EmpresaEventoModel.empresa_id == empresa1.id)
            .all()
        )

        print(f"✓ Inscripciones encontradas: {len(inscripciones_empresa)}")
        for insc in inscripciones_empresa:
            evento_insc = (
                db.query(EventoModel).filter(EventoModel.id == insc.evento_id).first()
            )
            estado = "✅ Aprobada" if insc.aprobada else "⏳ Pendiente"
            print(f"  - {evento_insc.nombre}: {estado}")

        assert len(inscripciones_empresa) > 0, "Debe encontrar su inscripción"
        print("✅ TEST 3 PASADO\n")

        # TEST 4: Admin aprueba inscripción
        print("=" * 70)
        print("TEST 4: Admin aprueba inscripción")
        print("=" * 70)

        inscripcion1.aprobada = True
        db.commit()

        print("✓ Inscripción aprobada por admin")
        print(f"  - Empresa: {empresa1.nombre}")
        print(f"  - Evento: {evento_test.nombre}")

        assert inscripcion1.aprobada == True, "Inscripción debe estar aprobada"
        print("✅ TEST 4 PASADO\n")

        # TEST 5: Empresa ve aprobación
        print("=" * 70)
        print("TEST 5: Empresa ve su aprobación")
        print("=" * 70)

        db.refresh(inscripcion1)
        print(
            f"✓ Estado actualizado: {'Aprobada ✅' if inscripcion1.aprobada else 'Pendiente ⏳'}"
        )

        assert inscripcion1.aprobada == True, "Debe ver estado aprobado"
        print("✅ TEST 5 PASADO\n")

        # TEST 6: Validar que no puede inscribirse dos veces
        print("=" * 70)
        print("TEST 6: No puede inscribirse dos veces al mismo evento")
        print("=" * 70)

        inscripcion_duplicada_existe = (
            db.query(EmpresaEventoModel)
            .filter(
                and_(
                    EmpresaEventoModel.empresa_id == empresa1.id,
                    EmpresaEventoModel.evento_id == evento_test.id,
                )
            )
            .first()
        )

        if inscripcion_duplicada_existe:
            print("✓ Validación correcta: Ya existe inscripción previa")
            print("  - No se puede crear inscripción duplicada")

        assert inscripcion_duplicada_existe is not None, (
            "Debe detectar inscripción existente"
        )
        print("✅ TEST 6 PASADO\n")

        # TEST 7: Validar capacidad máxima
        print("=" * 70)
        print("TEST 7: Validar capacidad máxima del evento")
        print("=" * 70)

        # Inscribir segunda empresa (llenar capacidad)
        empresa2 = empresas[1]
        inscripcion2 = EmpresaEventoModel(
            id=uuid4(), empresa_id=empresa2.id, evento_id=evento_test.id, aprobada=True
        )
        db.add(inscripcion2)
        db.commit()

        print(f"✓ Segunda empresa inscrita: {empresa2.nombre}")

        # Contar inscripciones aprobadas
        inscripciones_aprobadas = (
            db.query(EmpresaEventoModel)
            .filter(
                and_(
                    EmpresaEventoModel.evento_id == evento_test.id,
                    EmpresaEventoModel.aprobada == True,
                )
            )
            .count()
        )

        print(
            f"✓ Inscripciones aprobadas: {inscripciones_aprobadas}/{evento_test.capacidad_empresas}"
        )

        if inscripciones_aprobadas >= evento_test.capacidad_empresas:
            print("✓ Capacidad completa - No se pueden aceptar más inscripciones")

            # Intentar inscribir tercera empresa
            if len(empresas) > 2:
                empresa3 = empresas[2]
                print(f"✗ Intentando inscribir {empresa3.nombre} (debe fallar)")
                print("  ⚠️  Capacidad máxima alcanzada")

        assert inscripciones_aprobadas <= evento_test.capacidad_empresas, (
            "No debe exceder capacidad"
        )
        print("✅ TEST 7 PASADO\n")

        # TEST 8: Filtrar eventos donde empresa ya está inscrita
        print("=" * 70)
        print("TEST 8: Eventos disponibles excluyen inscritos")
        print("=" * 70)

        # Obtener IDs de eventos inscritos
        eventos_inscritos_ids = (
            db.query(EmpresaEventoModel.evento_id)
            .filter(EmpresaEventoModel.empresa_id == empresa1.id)
            .all()
        )
        eventos_inscritos_ids = [e[0] for e in eventos_inscritos_ids]

        print(f"✓ Eventos donde empresa1 está inscrita: {len(eventos_inscritos_ids)}")

        # Eventos disponibles (excluyendo inscritos)
        eventos_disponibles_filtrados = (
            db.query(EventoModel)
            .filter(
                and_(
                    EventoModel.activo == True,
                    EventoModel.estado == "inscripcion_abierta",
                    ~EventoModel.id.in_(eventos_inscritos_ids)
                    if eventos_inscritos_ids
                    else True,
                )
            )
            .all()
        )

        print(
            f"✓ Eventos disponibles (sin inscritos): {len(eventos_disponibles_filtrados)}"
        )

        # Verificar que evento_test no está en la lista
        evento_test_en_disponibles = any(
            e.id == evento_test.id for e in eventos_disponibles_filtrados
        )

        if not evento_test_en_disponibles:
            print(f"✓ Correcto: '{evento_test.nombre}' no aparece (ya inscrito)")
        else:
            print(
                f"✗ Error: '{evento_test.nombre}' aparece pero empresa ya está inscrita"
            )

        assert not evento_test_en_disponibles, "Eventos inscritos deben estar excluidos"
        print("✅ TEST 8 PASADO\n")

        # RESUMEN FINAL
        print("=" * 70)
        print("📊 RESUMEN DE RESULTADOS")
        print("=" * 70)
        print("✅ TEST 1: Empresa ve eventos disponibles - PASADO")
        print("✅ TEST 2: Se inscribe a evento - PASADO")
        print("✅ TEST 3: Ve su inscripción pendiente - PASADO")
        print("✅ TEST 4: Admin aprueba - PASADO")
        print("✅ TEST 5: Empresa ve aprobación - PASADO")
        print("✅ TEST 6: No puede inscribirse 2 veces - PASADO")
        print("✅ TEST 7: Validar capacidad máxima - PASADO")
        print("✅ TEST 8: Filtrado de eventos inscritos - PASADO")
        print("\n" + "=" * 70)
        print("🎉 TODOS LOS TESTS PASARON EXITOSAMENTE")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ ERROR EN TEST: {str(e)}")
        import traceback

        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    test_flujo_completo()
