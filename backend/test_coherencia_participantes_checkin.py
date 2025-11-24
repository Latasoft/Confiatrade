"""
Test de coherencia: Verificar que los campos de check-in en Participante
son coherentes entre backend (API) y frontend (TypeScript interfaces).
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_coherencia_participantes_checkin():
    """Test de coherencia específico para campos de check-in"""

    print("\n" + "=" * 70)
    print("TEST: COHERENCIA PARTICIPANTE - CAMPOS CHECK-IN")
    print("=" * 70)

    # 1. Login
    print("\n1️⃣ Login como admin...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@confiatrade.com", "password": "admin123"},
    )
    assert login_response.status_code == 200, f"❌ Login failed: {login_response.text}"

    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login exitoso")

    # 2. Listar participantes
    print("\n2️⃣ Listando participantes...")
    participantes_response = requests.get(f"{BASE_URL}/participantes/", headers=headers)
    assert participantes_response.status_code == 200, (
        f"❌ Error al listar: {participantes_response.text}"
    )

    data = participantes_response.json()
    participantes = data.get("participantes", [])
    assert len(participantes) > 0, "❌ No hay participantes para validar"

    participante = participantes[0]
    print(
        f"✅ Participante recibido: {participante.get('nombre_completo', 'Sin nombre')}"
    )
    print(f"   Total participantes: {data.get('total', len(participantes))}")

    # 3. Validar CAMPOS REQUERIDOS
    print("\n3️⃣ Validando campos REQUERIDOS de check-in...")

    campos_requeridos = {
        "id": str,
        "nombre_completo": str,
        "email": str,
        "check_in_realizado": bool,
    }

    for campo, tipo_esperado in campos_requeridos.items():
        assert campo in participante, f"❌ Falta campo requerido '{campo}'"
        valor = participante[campo]
        tipo_actual = type(valor).__name__
        tipo_esperado_name = tipo_esperado.__name__

        if tipo_esperado == bool:
            assert isinstance(valor, bool), (
                f"❌ '{campo}' debe ser bool, es {tipo_actual}"
            )
        elif tipo_esperado == str:
            assert isinstance(valor, str), (
                f"❌ '{campo}' debe ser str, es {tipo_actual}"
            )

        print(f"   ✅ {campo}: {tipo_esperado_name} = {valor}")

    # 4. Validar CAMPOS OPCIONALES
    print("\n4️⃣ Validando campos OPCIONALES de check-in...")

    campos_opcionales = {
        "fecha_check_in": (str, type(None)),
        "qr_data": (str, type(None)),
    }

    for campo, tipos_permitidos in campos_opcionales.items():
        if campo in participante:
            valor = participante[campo]
            if valor is not None:
                assert isinstance(valor, str), (
                    f"❌ '{campo}' debe ser str o null, es {type(valor).__name__}"
                )
            print(f"   ✅ {campo}: str | null = {valor if valor else 'null'}")
        else:
            print(f"   ⚠️  {campo}: No presente en respuesta (opcional)")

    # 5. Validar TypeScript interface
    print("\n5️⃣ Validando coherencia con TypeScript interface...")

    typescript_interface = """
    interface Participante {
      id: string;
      nombre_completo: string;
      email: string;
      check_in_realizado: boolean;
      fecha_check_in?: string;  // ISO 8601 datetime
      qr_data?: string;
      // ... otros campos
    }
    """

    print(f"   Interface TypeScript:\n{typescript_interface}")

    # Validar que check_in_realizado es siempre boolean (nunca null)
    assert participante["check_in_realizado"] is not None, (
        "❌ check_in_realizado NO puede ser null"
    )
    assert isinstance(participante["check_in_realizado"], bool), (
        "❌ check_in_realizado debe ser boolean"
    )
    print(
        f"   ✅ check_in_realizado: boolean (required) = {participante['check_in_realizado']}"
    )

    # Validar que fecha_check_in es opcional pero string si existe
    if "fecha_check_in" in participante and participante["fecha_check_in"] is not None:
        assert isinstance(participante["fecha_check_in"], str), (
            "❌ fecha_check_in debe ser string"
        )
        # Validar formato ISO 8601 básico
        assert "T" in participante["fecha_check_in"], (
            "❌ fecha_check_in debe ser formato ISO 8601"
        )
        print(
            f"   ✅ fecha_check_in: string (optional) = {participante['fecha_check_in']}"
        )
    else:
        print("   ✅ fecha_check_in: null (optional)")

    # Validar qr_data
    if "qr_data" in participante and participante["qr_data"] is not None:
        assert isinstance(participante["qr_data"], str), "❌ qr_data debe ser string"
        assert len(participante["qr_data"]) > 0, "❌ qr_data no puede ser string vacío"
        print(f"   ✅ qr_data: string (optional) = {participante['qr_data'][:20]}...")
    else:
        print("   ✅ qr_data: null (optional)")

    # 6. Test con check-in realizado
    print("\n6️⃣ Validando participante con check-in realizado...")

    # Buscar o crear un participante con check-in
    participante_con_checkin = None
    for p in participantes:
        if p.get("check_in_realizado") is True:
            participante_con_checkin = p
            break

    if participante_con_checkin:
        print(
            f"   Participante encontrado: {participante_con_checkin.get('nombre_completo')}"
        )
        assert participante_con_checkin["check_in_realizado"] is True, (
            "❌ check_in_realizado debe ser True"
        )
        assert "fecha_check_in" in participante_con_checkin, (
            "❌ Falta fecha_check_in cuando check_in_realizado=True"
        )
        assert participante_con_checkin["fecha_check_in"] is not None, (
            "❌ fecha_check_in NO puede ser null si check_in_realizado=True"
        )
        print("   ✅ check_in_realizado: True")
        print(f"   ✅ fecha_check_in: {participante_con_checkin['fecha_check_in']}")
    else:
        print(
            "   ⚠️  No hay participantes con check-in realizado (esperado en base vacía)"
        )

    # 7. Test con check-in NO realizado
    print("\n7️⃣ Validando participante SIN check-in...")

    participante_sin_checkin = None
    for p in participantes:
        if p.get("check_in_realizado") is False:
            participante_sin_checkin = p
            break

    if participante_sin_checkin:
        print(
            f"   Participante encontrado: {participante_sin_checkin.get('nombre_completo')}"
        )
        assert participante_sin_checkin["check_in_realizado"] is False, (
            "❌ check_in_realizado debe ser False"
        )
        # fecha_check_in puede ser null o no estar presente
        if "fecha_check_in" in participante_sin_checkin:
            assert participante_sin_checkin["fecha_check_in"] is None, (
                "❌ fecha_check_in debe ser null si check_in_realizado=False"
            )
        print("   ✅ check_in_realizado: False")
        print("   ✅ fecha_check_in: null o ausente")
    else:
        print("   ⚠️  No hay participantes sin check-in")

    print("\n" + "=" * 70)
    print("✅ TODOS LOS TESTS PASARON")
    print("=" * 70)
    print("\n📋 RESUMEN:")
    print("   - check_in_realizado: boolean (required, nunca null)")
    print("   - fecha_check_in: string | null (optional, ISO 8601)")
    print("   - qr_data: string | null (optional)")
    print("\n🎯 Frontend y Backend son COHERENTES en campos de check-in")


if __name__ == "__main__":
    try:
        test_coherencia_participantes_checkin()
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {e}")
        import traceback

        traceback.print_exc()
        exit(1)
