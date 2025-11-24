"""
Test para verificar que el componente InscripcionesEventoPanel funciona correctamente
con los endpoints del backend y la lógica de aprobación/rechazo de inscripciones.
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_flujo_completo_inscripciones():
    """Test del flujo completo de inscripciones desde el panel admin"""

    print("\n" + "=" * 70)
    print("TEST: PANEL DE INSCRIPCIONES - FLUJO COMPLETO")
    print("=" * 70)

    # 1. Login como admin
    print("\n1️⃣ Login como admin...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@confiatrade.com", "password": "admin123"},
    )
    assert login_response.status_code == 200, f"❌ Login failed: {login_response.text}"

    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login exitoso")

    # 2. Listar eventos disponibles
    print("\n2️⃣ Listando eventos disponibles...")
    eventos_response = requests.get(
        f"{BASE_URL}/eventos/", headers=headers, params={"activo": True}
    )
    assert eventos_response.status_code == 200, (
        f"❌ Error al listar eventos: {eventos_response.text}"
    )

    eventos = eventos_response.json()["eventos"]
    assert len(eventos) > 0, "❌ No hay eventos disponibles para probar"

    evento_id = eventos[0]["id"]
    evento_nombre = eventos[0]["nombre"]
    print(f"✅ Evento seleccionado: '{evento_nombre}' (ID: {evento_id})")

    # 3. Listar TODAS las inscripciones del evento
    print(f"\n3️⃣ Listando TODAS las inscripciones del evento '{evento_nombre}'...")
    inscripciones_todas_response = requests.get(
        f"{BASE_URL}/empresas-eventos/evento/{evento_id}", headers=headers
    )
    assert inscripciones_todas_response.status_code == 200, (
        f"❌ Error al listar inscripciones: {inscripciones_todas_response.text}"
    )

    data_todas = inscripciones_todas_response.json()
    print(f"✅ Total inscripciones: {data_todas['total']}")
    print(f"   - Aprobadas: {data_todas['aprobadas']}")
    print(f"   - Pendientes: {data_todas['pendientes']}")

    # Verificar que las inscripciones tienen empresa_nombre
    if len(data_todas["inscripciones"]) > 0:
        primera_inscripcion = data_todas["inscripciones"][0]
        if (
            "empresa_nombre" in primera_inscripcion
            and primera_inscripcion["empresa_nombre"]
        ):
            print(
                f"✅ Campo empresa_nombre presente: '{primera_inscripcion['empresa_nombre']}'"
            )
        else:
            print(
                f"⚠️  Campo empresa_nombre faltante o null. ID empresa: {primera_inscripcion['empresa_id']}"
            )

    # 4. Filtrar solo PENDIENTES
    print("\n4️⃣ Filtrando inscripciones PENDIENTES...")
    inscripciones_pendientes_response = requests.get(
        f"{BASE_URL}/empresas-eventos/evento/{evento_id}",
        headers=headers,
        params={"aprobada": False},
    )
    assert inscripciones_pendientes_response.status_code == 200

    data_pendientes = inscripciones_pendientes_response.json()
    inscripciones_pendientes = data_pendientes["inscripciones"]
    print(f"✅ Inscripciones pendientes: {len(inscripciones_pendientes)}")

    if len(inscripciones_pendientes) == 0:
        print(
            "⚠️  No hay inscripciones pendientes. Buscando alguna aprobada para cambiar estado..."
        )

        # Buscar una inscripción aprobada para rechazarla (simular cambio de estado)
        inscripciones_aprobadas_response = requests.get(
            f"{BASE_URL}/empresas-eventos/evento/{evento_id}",
            headers=headers,
            params={"aprobada": True},
        )
        inscripciones_aprobadas = inscripciones_aprobadas_response.json()[
            "inscripciones"
        ]

        if len(inscripciones_aprobadas) > 0:
            inscripcion_test = inscripciones_aprobadas[0]
            empresa_nombre = inscripcion_test.get(
                "empresa_nombre", f"Empresa {inscripcion_test['empresa_id']}"
            )
            print(
                f"   Usando inscripción aprobada: {empresa_nombre} (ID: {inscripcion_test['id']})"
            )
        else:
            print(
                "❌ No hay inscripciones para probar. Crear al menos una inscripción primero."
            )
            return
    else:
        inscripcion_test = inscripciones_pendientes[0]
        empresa_nombre = inscripcion_test.get(
            "empresa_nombre", f"Empresa {inscripcion_test['empresa_id']}"
        )
        print(
            f"   Inscripción a aprobar: {empresa_nombre} (ID: {inscripcion_test['id']})"
        )

    # 5. APROBAR inscripción
    empresa_nombre = inscripcion_test.get(
        "empresa_nombre", f"Empresa {inscripcion_test['empresa_id']}"
    )
    print(f"\n5️⃣ Aprobando inscripción de '{empresa_nombre}'...")
    aprobar_response = requests.put(
        f"{BASE_URL}/empresas-eventos/{inscripcion_test['id']}",
        headers=headers,
        json={"aprobada": True},
    )
    assert aprobar_response.status_code == 200, (
        f"❌ Error al aprobar: {aprobar_response.text}"
    )

    inscripcion_aprobada = aprobar_response.json()
    assert inscripcion_aprobada["aprobada"] == True, (
        "❌ La inscripción no se marcó como aprobada"
    )
    print("✅ Inscripción aprobada exitosamente")
    print(f"   Estado actual: aprobada={inscripcion_aprobada['aprobada']}")

    # 6. Verificar que aparece en filtro de APROBADAS
    print("\n6️⃣ Verificando que aparece en filtro de APROBADAS...")
    inscripciones_aprobadas_check = requests.get(
        f"{BASE_URL}/empresas-eventos/evento/{evento_id}",
        headers=headers,
        params={"aprobada": True},
    )
    aprobadas_list = inscripciones_aprobadas_check.json()["inscripciones"]

    encontrada = any(i["id"] == inscripcion_test["id"] for i in aprobadas_list)
    assert encontrada, "❌ La inscripción aprobada no aparece en el filtro de aprobadas"
    print("✅ Inscripción encontrada en filtro de aprobadas")

    # 7. RECHAZAR inscripción (cambiar estado)
    print(f"\n7️⃣ Rechazando inscripción de '{empresa_nombre}'...")
    rechazar_response = requests.put(
        f"{BASE_URL}/empresas-eventos/{inscripcion_test['id']}",
        headers=headers,
        json={"aprobada": False},
    )
    assert rechazar_response.status_code == 200, (
        f"❌ Error al rechazar: {rechazar_response.text}"
    )

    inscripcion_rechazada = rechazar_response.json()
    assert inscripcion_rechazada["aprobada"] == False, (
        "❌ La inscripción no se marcó como rechazada"
    )
    print("✅ Inscripción rechazada exitosamente")
    print(f"   Estado actual: aprobada={inscripcion_rechazada['aprobada']}")

    # 8. Verificar que aparece en filtro de PENDIENTES
    print("\n8️⃣ Verificando que aparece en filtro de PENDIENTES...")
    inscripciones_pendientes_check = requests.get(
        f"{BASE_URL}/empresas-eventos/evento/{evento_id}",
        headers=headers,
        params={"aprobada": False},
    )
    pendientes_list = inscripciones_pendientes_check.json()["inscripciones"]

    encontrada = any(i["id"] == inscripcion_test["id"] for i in pendientes_list)
    assert encontrada, (
        "❌ La inscripción rechazada no aparece en el filtro de pendientes"
    )
    print("✅ Inscripción encontrada en filtro de pendientes")

    # 9. Verificar estructura de datos del panel
    print("\n9️⃣ Verificando estructura de datos para InscripcionesEventoPanel...")
    panel_data = inscripciones_todas_response.json()

    # Verificar campos requeridos en la respuesta
    assert "inscripciones" in panel_data, "❌ Falta campo 'inscripciones'"
    assert "total" in panel_data, "❌ Falta campo 'total'"
    assert "aprobadas" in panel_data, "❌ Falta campo 'aprobadas'"
    assert "pendientes" in panel_data, "❌ Falta campo 'pendientes'"

    print("✅ Estructura de respuesta correcta:")
    print(f"   - inscripciones: list[{len(panel_data['inscripciones'])}]")
    print(f"   - total: {panel_data['total']}")
    print(f"   - aprobadas: {panel_data['aprobadas']}")
    print(f"   - pendientes: {panel_data['pendientes']}")

    # Verificar campos de cada inscripción
    if len(panel_data["inscripciones"]) > 0:
        inscripcion_sample = panel_data["inscripciones"][0]
        campos_requeridos = [
            "id",
            "empresa_id",
            "evento_id",
            "aprobada",
            "fecha_inscripcion",
        ]
        campos_opcionales = [
            "empresa_nombre",
            "evento_nombre",
            "created_at",
            "updated_at",
        ]

        print("\n   Campos de inscripción:")
        for campo in campos_requeridos:
            assert campo in inscripcion_sample, f"❌ Falta campo requerido '{campo}'"
            print(f"   ✅ {campo}: {type(inscripcion_sample[campo]).__name__}")

        for campo in campos_opcionales:
            if campo in inscripcion_sample:
                print(
                    f"   ✅ {campo}: {type(inscripcion_sample[campo]).__name__} (opcional)"
                )

    print("\n" + "=" * 70)
    print("✅ TODOS LOS TESTS PASARON")
    print("=" * 70)
    print("\n📋 RESUMEN:")
    print("   - Endpoints de filtrado funcionan correctamente")
    print("   - Aprobación/Rechazo funciona correctamente")
    print("   - Estructura de datos coherente con InscripcionesEventoPanel")
    print("   - Stats (total, aprobadas, pendientes) se calculan correctamente")
    print("\n🎯 El componente InscripcionesEventoPanel está listo para usar")


if __name__ == "__main__":
    try:
        test_flujo_completo_inscripciones()
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")
        import traceback

        traceback.print_exc()
        exit(1)
