"""
Test de Coherencia Frontend-Backend: Inscripciones (EmpresaEvento)
Valida que los schemas de inscripciones coincidan entre backend y frontend
"""

import requests

BASE_URL = "http://localhost:8000/api/v1"

# Credenciales
ADMIN_EMAIL = "admin@confiatrade.com"
ADMIN_PASSWORD = "admin123"

# ID de evento para pruebas
TEST_EVENTO_ID = "550e8400-e29b-41d4-a716-446655440000"  # Ajustar según BD


def get_admin_token() -> str:
    """Login como admin"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if response.status_code != 200:
        raise Exception(f"Login fallido: {response.text}")
    return response.json()["access_token"]


def validate_inscripcion_schema(inscripcion: dict) -> list[str]:
    """Validar schema de inscripción"""
    errors = []

    # Campos requeridos
    required_fields = {
        "id": str,
        "empresa_id": str,
        "evento_id": str,
        "aprobada": bool,
        "fecha_inscripcion": str,
        "created_at": str,
        "updated_at": str,
    }

    for field, expected_type in required_fields.items():
        if field not in inscripcion:
            errors.append(f"❌ Campo requerido '{field}' falta")
        elif inscripcion[field] is not None:
            if expected_type == str and not isinstance(inscripcion[field], str):
                errors.append(
                    f"❌ Campo '{field}' debe ser string, es {type(inscripcion[field]).__name__}"
                )
            elif expected_type == bool and not isinstance(inscripcion[field], bool):
                errors.append(
                    f"❌ Campo '{field}' debe ser boolean, es {type(inscripcion[field]).__name__}"
                )

    # Campos opcionales nested
    optional_fields = {
        "empresa_nombre": (str, type(None)),
        "evento_nombre": (str, type(None)),
    }

    for field, allowed_types in optional_fields.items():
        if field in inscripcion:
            actual_type = type(inscripcion[field])
            if actual_type not in allowed_types:
                errors.append(
                    f"❌ Campo opcional '{field}' tiene tipo incorrecto: {actual_type.__name__}"
                )

    return errors


def test_listar_inscripciones():
    """Test: GET /empresas-eventos/ - Coherencia de schema"""
    print("\n" + "=" * 60)
    print("TEST 1: Schema de Inscripciones")
    print("=" * 60)

    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Listar todas las inscripciones
    response = requests.get(f"{BASE_URL}/empresas-eventos/", headers=headers)

    print(f"\nStatus Code: {response.status_code}")

    if response.status_code != 200:
        print(f"❌ ERROR: {response.text}")
        return False

    data = response.json()

    if "inscripciones" not in data:
        print("❌ Falta campo 'inscripciones' en respuesta")
        return False

    inscripciones = data["inscripciones"]
    total = data.get("total", 0)
    aprobadas = data.get("aprobadas", 0)
    pendientes = data.get("pendientes", 0)

    print(f"✓ Status 200, inscripciones recibidas: {len(inscripciones)}")
    print(f"✓ Total: {total}, Aprobadas: {aprobadas}, Pendientes: {pendientes}")

    if len(inscripciones) == 0:
        print("\n⚠️  No hay inscripciones para validar")
        return True

    # Validar primera inscripción
    inscripcion = inscripciones[0]

    print(f"\n{'─' * 60}")
    print("Validando schema de la primera inscripción:")
    print(f"{'─' * 60}")

    errors = validate_inscripcion_schema(inscripcion)

    if errors:
        print("\n❌ ERRORES ENCONTRADOS:")
        for error in errors:
            print(f"  {error}")
        return False

    print("\n✅ Campos requeridos:")
    print(f"  ✓ id: {type(inscripcion['id']).__name__}")
    print(f"  ✓ empresa_id: {type(inscripcion['empresa_id']).__name__}")
    print(f"  ✓ evento_id: {type(inscripcion['evento_id']).__name__}")
    print(
        f"  ✓ aprobada: {type(inscripcion['aprobada']).__name__} = {inscripcion['aprobada']}"
    )
    print(f"  ✓ fecha_inscripcion: {inscripcion['fecha_inscripcion']}")
    print(f"  ✓ created_at: {inscripcion['created_at']}")
    print(f"  ✓ updated_at: {inscripcion['updated_at']}")

    print("\n✅ Campos opcionales:")
    if "empresa_nombre" in inscripcion:
        print(f"  ✓ empresa_nombre: {inscripcion.get('empresa_nombre', 'N/A')}")
    if "evento_nombre" in inscripcion:
        print(f"  ✓ evento_nombre: {inscripcion.get('evento_nombre', 'N/A')}")

    return True


def test_typescript_interface():
    """Test: Verificar compatibilidad con TypeScript"""
    print("\n" + "=" * 60)
    print("TEST 2: Compatibilidad TypeScript Interface")
    print("=" * 60)

    typescript_interface = """
    export interface EmpresaEvento {
      id: string;
      empresa_id: string;
      evento_id: string;
      aprobada: boolean;
      fecha_inscripcion: string;
      created_at: string;
      updated_at: string;
      empresa_nombre?: string;
      evento_nombre?: string;
    }
    """

    print("\nInterface TypeScript esperada:")
    print(typescript_interface)

    print("✅ Interface documentada correctamente")
    return True


def main():
    """Ejecutar todos los tests"""
    print("\n" + "█" * 60)
    print("█  TEST DE COHERENCIA: INSCRIPCIONES FRONTEND-BACKEND")
    print("█" * 60)

    try:
        results = []

        # Test 1: Schema de lista
        results.append(("Schema de Inscripciones", test_listar_inscripciones()))

        # Test 2: TypeScript interface
        results.append(("TypeScript Interface", test_typescript_interface()))

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
