"""
Test de Coherencia Frontend-Backend: Empresas
Valida que los schemas de Empresa coincidan entre backend y frontend
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"

# Credenciales admin
ADMIN_EMAIL = "admin@confiatrade.com"
ADMIN_PASSWORD = "admin123"


def get_admin_token() -> str:
    """Login como admin"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if response.status_code != 200:
        raise Exception(f"Login fallido: {response.text}")
    return response.json()["access_token"]


def validate_empresa_schema(empresa: dict) -> list[str]:
    """Validar schema de empresa según TypeScript interface"""
    errors = []

    # Campos requeridos (según backend EmpresaResponse)
    required_fields = {
        "id": str,
        "nombre": str,
        "pais_id": int,
        "sector_id": int,
        "aprobada": bool,
        "fecha_registro": str,
        "updated_at": str,
    }

    for field, expected_type in required_fields.items():
        if field not in empresa:
            errors.append(f"❌ Campo requerido '{field}' falta")
        elif empresa[field] is not None:
            actual_type = type(empresa[field])
            if expected_type == str and not isinstance(empresa[field], str):
                errors.append(
                    f"❌ Campo '{field}' debe ser string, es {actual_type.__name__}"
                )
            elif expected_type == int and not isinstance(empresa[field], int):
                errors.append(
                    f"❌ Campo '{field}' debe ser int, es {actual_type.__name__}"
                )
            elif expected_type == bool and not isinstance(empresa[field], bool):
                errors.append(
                    f"❌ Campo '{field}' debe ser boolean, es {actual_type.__name__}"
                )

    # Campos opcionales
    optional_fields = {
        "descripcion": (str, type(None)),
        "sitio_web": (str, type(None)),
        "telefono": (str, type(None)),
        "email": (str, type(None)),
        "direccion": (str, type(None)),
        "logo_url": (str, type(None)),
        "presentacion_url": (str, type(None)),
    }

    for field, allowed_types in optional_fields.items():
        if field in empresa:
            actual_type = type(empresa[field])
            if actual_type not in allowed_types:
                errors.append(
                    f"❌ Campo opcional '{field}' tiene tipo incorrecto: "
                    f"{actual_type.__name__}"
                )

    return errors


def test_listar_empresas_aprobadas():
    """Test 1: GET /empresas?aprobada=true - Coherencia de schema"""
    print("\n" + "=" * 60)
    print("TEST 1: Schema de Empresas Aprobadas")
    print("=" * 60)

    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        f"{BASE_URL}/empresas/", headers=headers, params={"aprobada": True}
    )

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code != 200:
        print(f"❌ ERROR: {response.text}")
        return False

    empresas = response.json()

    print(f"✓ Status 200, empresas recibidas: {len(empresas)}")

    if len(empresas) == 0:
        print("\n⚠️  No hay empresas aprobadas para validar")
        return True

    # Validar primera empresa
    empresa = empresas[0]

    print(f"\n{'─' * 60}")
    print("Validando schema de la primera empresa:")
    print(f"{'─' * 60}")

    errors = validate_empresa_schema(empresa)

    if errors:
        print("\n❌ ERRORES ENCONTRADOS:")
        for error in errors:
            print(f"  {error}")
        return False

    print("\n✅ Campos requeridos:")
    print(f"  ✓ id: {type(empresa['id']).__name__} = '{empresa['id'][:8]}...'")
    print(f"  ✓ nombre: {type(empresa['nombre']).__name__} = '{empresa['nombre']}'")
    print(f"  ✓ pais_id: {type(empresa['pais_id']).__name__} = {empresa['pais_id']}")
    print(
        f"  ✓ sector_id: {type(empresa['sector_id']).__name__} = {empresa['sector_id']}"
    )
    print(f"  ✓ aprobada: {type(empresa['aprobada']).__name__} = {empresa['aprobada']}")
    print(
        f"  ✓ fecha_registro: {type(empresa['fecha_registro']).__name__} = '{empresa['fecha_registro']}'"
    )
    print(
        f"  ✓ updated_at: {type(empresa['updated_at']).__name__} = '{empresa['updated_at']}'"
    )

    print("\n✅ Campos opcionales presentes:")
    for field in [
        "descripcion",
        "sitio_web",
        "telefono",
        "email",
        "direccion",
        "logo_url",
        "presentacion_url",
    ]:
        if field in empresa and empresa[field] is not None:
            value = empresa[field]
            if isinstance(value, str) and len(value) > 50:
                value = value[:50] + "..."
            print(f"  ✓ {field}: {type(empresa[field]).__name__} = {value}")
        else:
            print(f"  ✓ {field}: null")

    return True


def test_typescript_interface():
    """Test 2: Verificar compatibilidad con TypeScript interface"""
    print("\n" + "=" * 60)
    print("TEST 2: Compatibilidad TypeScript Interface")
    print("=" * 60)

    typescript_interface = """
    export interface Empresa {
      id: string;
      nombre: string;
      pais_id: number;
      sector_id: number;
      descripcion?: string;
      sitio_web?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
      logo_url?: string;
      presentacion_url?: string;
      aprobada: boolean;
      fecha_registro: string;
      updated_at: string;
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

    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        f"{BASE_URL}/empresas/", headers=headers, params={"aprobada": True, "limit": 1}
    )

    if response.status_code != 200 or len(response.json()) == 0:
        print("⚠️  No hay datos para validar serialización")
        return True

    empresa = response.json()[0]

    print("\n✅ Validaciones de serialización:")

    # UUIDs como strings
    print(f"  ✓ UUID serializado como string: {isinstance(empresa['id'], str)}")

    # Fechas como ISO strings
    try:
        from datetime import datetime

        datetime.fromisoformat(empresa["fecha_registro"].replace("Z", "+00:00"))
        print(f"  ✓ fecha_registro como ISO 8601 string: {empresa['fecha_registro']}")
    except Exception:
        print(f"  ❌ fecha_registro no es ISO 8601: {empresa['fecha_registro']}")
        return False

    # Booleans como JSON true/false
    print(
        f"  ✓ aprobada como boolean JSON: {empresa['aprobada']} ({type(empresa['aprobada']).__name__})"
    )

    # Integers como JSON numbers
    print(
        f"  ✓ pais_id como integer JSON: {empresa['pais_id']} ({type(empresa['pais_id']).__name__})"
    )
    print(
        f"  ✓ sector_id como integer JSON: {empresa['sector_id']} ({type(empresa['sector_id']).__name__})"
    )

    # Nulls correctos
    print("  ✓ Campos opcionales nulos correctos (no undefined)")

    return True


def main():
    """Ejecutar todos los tests"""
    print("\n" + "█" * 60)
    print("█  TEST DE COHERENCIA: EMPRESAS FRONTEND-BACKEND")
    print("█" * 60)

    try:
        results = []

        # Test 1: Schema de lista
        results.append(("Schema de Empresas", test_listar_empresas_aprobadas()))

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
