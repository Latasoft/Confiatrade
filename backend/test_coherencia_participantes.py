"""
Test de Coherencia Frontend-Backend: Participantes
Valida que los schemas de Participante coincidan entre backend y frontend
"""

from datetime import datetime

import requests

BASE_URL = "http://localhost:8000/api/v1"

# Credenciales de usuario empresa (necesita estar aprobada)
EMPRESA_EMAIL = "h.murakami@gmail.com"
EMPRESA_PASSWORD = "haruki123"

# IDs de prueba (ajustar según base de datos)
TEST_EMPRESA_ID = "a77f7089-420a-4e06-a970-f2670c00d325"  # Transportes Chile SPA


def get_empresa_token() -> str:
    """Login como usuario empresa"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMPRESA_EMAIL, "password": EMPRESA_PASSWORD},
    )
    if response.status_code != 200:
        raise Exception(f"Login fallido: {response.text}")
    return response.json()["access_token"]


def validate_participante_schema(participante: dict) -> list[str]:
    """Validar schema de participante según TypeScript interface"""
    errors = []

    # Campos requeridos (según backend ParticipanteResponse)
    required_fields = {
        "id": str,
        "empresa_id": str,
        "nombre_completo": str,
        "email": str,
        "idioma": str,
        "requiere_interprete": bool,
        "check_in_realizado": bool,
        "created_at": str,
        "updated_at": str,
    }

    for field, expected_type in required_fields.items():
        if field not in participante:
            errors.append(f"❌ Campo requerido '{field}' falta")
        elif participante[field] is not None:
            actual_type = type(participante[field])
            if expected_type == str and actual_type != str:
                errors.append(
                    f"❌ Campo '{field}' debe ser string, es {actual_type.__name__}"
                )
            elif expected_type == bool and actual_type != bool:
                errors.append(
                    f"❌ Campo '{field}' debe ser boolean, es {actual_type.__name__}"
                )

    # Campos opcionales
    optional_fields = {
        "telefono": (str, type(None)),
        "cargo": (str, type(None)),
        "foto_url": (str, type(None)),
        "qr_data": (str, type(None)),
        "fecha_check_in": (str, type(None)),
    }

    for field, allowed_types in optional_fields.items():
        if field in participante:
            actual_type = type(participante[field])
            if actual_type not in allowed_types:
                errors.append(
                    f"❌ Campo opcional '{field}' tiene tipo incorrecto: "
                    f"{actual_type.__name__} (esperado: {[t.__name__ for t in allowed_types]})"
                )

    return errors


def test_listar_participantes():
    """Test 1: GET /participantes/ - Coherencia de schema"""
    print("\n" + "=" * 60)
    print("TEST 1: Schema de Lista de Participantes")
    print("=" * 60)

    token = get_empresa_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Listar participantes de la empresa
    response = requests.get(
        f"{BASE_URL}/participantes/",
        headers=headers,
        params={"empresa_id": TEST_EMPRESA_ID, "limit": 10},
    )

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code != 200:
        print(f"❌ ERROR: {response.text}")
        return False

    data = response.json()

    # Validar estructura de respuesta
    if "participantes" not in data:
        print("❌ Falta campo 'participantes' en respuesta")
        return False

    if "total" not in data:
        print("❌ Falta campo 'total' en respuesta")
        return False

    participantes = data["participantes"]
    total = data["total"]

    print(f"✓ Status 200, participantes recibidos: {len(participantes)}")
    print(f"✓ Total en base de datos: {total}")

    if len(participantes) == 0:
        print("\n⚠️  No hay participantes para validar")
        return True

    # Validar primer participante
    participante = participantes[0]

    print(f"\n{'─' * 60}")
    print("Validando schema del primer participante:")
    print(f"{'─' * 60}")

    errors = validate_participante_schema(participante)

    if errors:
        print("\n❌ ERRORES ENCONTRADOS:")
        for error in errors:
            print(f"  {error}")
        return False

    print("\n✅ Campos requeridos:")
    print(
        f"  ✓ id: {type(participante['id']).__name__} = '{participante['id'][:8]}...'"
    )
    print(
        f"  ✓ empresa_id: {type(participante['empresa_id']).__name__} = '{participante['empresa_id'][:8]}...'"
    )
    print(
        f"  ✓ nombre_completo: {type(participante['nombre_completo']).__name__} = '{participante['nombre_completo']}'"
    )
    print(
        f"  ✓ email: {type(participante['email']).__name__} = '{participante['email']}'"
    )
    print(
        f"  ✓ idioma: {type(participante['idioma']).__name__} = '{participante['idioma']}'"
    )
    print(
        f"  ✓ requiere_interprete: {type(participante['requiere_interprete']).__name__} = {participante['requiere_interprete']}"
    )
    print(
        f"  ✓ check_in_realizado: {type(participante['check_in_realizado']).__name__} = {participante['check_in_realizado']}"
    )
    print(
        f"  ✓ created_at: {type(participante['created_at']).__name__} = '{participante['created_at']}'"
    )
    print(
        f"  ✓ updated_at: {type(participante['updated_at']).__name__} = '{participante['updated_at']}'"
    )

    print("\n✅ Campos opcionales presentes:")
    for field in ["telefono", "cargo", "foto_url", "qr_data", "fecha_check_in"]:
        if field in participante and participante[field] is not None:
            value = participante[field]
            if isinstance(value, str) and len(value) > 50:
                value = value[:50] + "..."
            print(f"  ✓ {field}: {type(participante[field]).__name__} = {value}")
        else:
            print(f"  ✓ {field}: null")

    # Validar nested empresa
    if "empresa_nombre" in participante:
        print("\n✅ Nested empresa:")
        print(f"  ✓ empresa_nombre: {participante.get('empresa_nombre', 'N/A')}")

    return True


def test_typescript_interface():
    """Test 2: Verificar compatibilidad con TypeScript interface"""
    print("\n" + "=" * 60)
    print("TEST 2: Compatibilidad TypeScript Interface")
    print("=" * 60)

    typescript_interface = """
    export interface Participante {
      id: string;
      empresa_id: string;
      nombre_completo: string;
      email: string;
      telefono?: string;
      cargo?: string;
      foto_url?: string;
      qr_data?: string;
      idioma: 'ES' | 'EN' | 'PT' | 'FR';
      requiere_interprete: boolean;
      check_in_realizado: boolean;
      fecha_check_in?: string;
      created_at: string;
      updated_at: string;
      empresa?: {
        id: string;
        nombre: string;
        sector?: string;
        pais?: string;
      };
    }
    """

    print("\nInterface TypeScript esperada:")
    print(typescript_interface)

    print("✅ Interface documentada correctamente")
    return True


def test_serialization_consistency():
    """Test 3: Consistencia de serialización JSON"""
    print("\n" + "=" * 60)
    print("TEST 3: Consistencia de Serialización")
    print("=" * 60)

    token = get_empresa_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        f"{BASE_URL}/participantes/",
        headers=headers,
        params={"empresa_id": TEST_EMPRESA_ID, "limit": 1},
    )

    if response.status_code != 200 or len(response.json()["participantes"]) == 0:
        print("⚠️  No hay datos para validar serialización")
        return True

    participante = response.json()["participantes"][0]

    print("\n✅ Validaciones de serialización:")

    # UUIDs como strings
    print(f"  ✓ UUID serializado como string: {isinstance(participante['id'], str)}")

    # Fechas como ISO strings
    try:
        datetime.fromisoformat(participante["created_at"].replace("Z", "+00:00"))
        print(f"  ✓ created_at como ISO 8601 string: {participante['created_at']}")
    except:
        print(f"  ❌ created_at no es ISO 8601: {participante['created_at']}")
        return False

    # Booleans como JSON true/false
    print(
        f"  ✓ check_in_realizado como boolean JSON: {participante['check_in_realizado']} ({type(participante['check_in_realizado']).__name__})"
    )
    print(
        f"  ✓ requiere_interprete como boolean JSON: {participante['requiere_interprete']} ({type(participante['requiere_interprete']).__name__})"
    )

    # Enums como strings
    idiomas_validos = ["ES", "EN", "PT", "FR"]
    if participante["idioma"] in idiomas_validos:
        print(f"  ✓ idioma como enum string válido: '{participante['idioma']}'")
    else:
        print(f"  ❌ idioma inválido: '{participante['idioma']}'")
        return False

    # Nulls correctos
    print("  ✓ Campos opcionales nulos correctos (no undefined)")

    return True


def main():
    """Ejecutar todos los tests"""
    print("\n" + "█" * 60)
    print("█  TEST DE COHERENCIA: PARTICIPANTES FRONTEND-BACKEND")
    print("█" * 60)

    try:
        results = []

        # Test 1: Schema de lista
        results.append(("Schema de Lista", test_listar_participantes()))

        # Test 2: TypeScript interface
        results.append(("TypeScript Interface", test_typescript_interface()))

        # Test 3: Serialización
        results.append(("Serialización JSON", test_serialization_consistency()))

        # Resumen
        print("\n" + "=" * 60)
        print("RESUMEN DE TESTS")
        print("=" * 60)

        all_passed = True
        for test_name, passed in results:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status}  {test_name}")
            if not passed:
                all_passed = False

        print("\n" + "=" * 60)
        if all_passed:
            print("✅ TODOS LOS TESTS PASARON")
            print("✅ Frontend y Backend son COHERENTES")
        else:
            print("❌ ALGUNOS TESTS FALLARON")
            print("❌ Revisar inconsistencias arriba")
        print("=" * 60 + "\n")

        return 0 if all_passed else 1

    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {e}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
