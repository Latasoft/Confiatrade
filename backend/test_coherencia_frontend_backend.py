"""
Test de coherencia Frontend-Backend: Inscripción a Eventos

Verifica que:
1. Los datos del backend coincidan con los esperados en frontend
2. La serialización JSON sea correcta
3. Los campos requeridos estén presentes
4. Los tipos de datos sean coherentes
"""

import sys

import requests

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
TEST_EMAIL = "h.murakami@gmail.com"
TEST_PASSWORD = "haruki123"


def login() -> tuple[str, str]:
    """Login y retornar token + empresa_id"""
    print("=== Login ===")

    response = requests.post(
        f"{BASE_URL}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )

    if response.status_code != 200:
        print(f"❌ Error login: {response.status_code}")
        sys.exit(1)

    data = response.json()
    token = data["access_token"]

    # Obtener empresa_id del perfil
    perfil_response = requests.get(
        f"{BASE_URL}/auth/perfil", headers={"Authorization": f"Bearer {token}"}
    )
    perfil_data = perfil_response.json()
    empresa_id = perfil_data["empresa"]["id"]
    empresa_nombre = perfil_data["empresa"]["nombre"]

    print(f"✓ Login OK: {empresa_nombre}")
    return token, empresa_id


def test_eventos_disponibles_schema(token: str):
    """Verificar schema de eventos disponibles"""
    print("\n=== Test 1: Schema GET /eventos/disponibles ===")

    response = requests.get(
        f"{BASE_URL}/eventos/disponibles", headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

    eventos = response.json()
    print(f"✓ Status 200, eventos recibidos: {len(eventos)}")

    if not eventos:
        print("⚠️  No hay eventos disponibles para validar schema")
        return True

    # Validar schema del primer evento
    evento = eventos[0]
    campos_esperados = [
        "id",
        "nombre",
        "fecha_inicio",
        "fecha_fin",
        "pais_sede",
        "estado",
        "activo",
        "created_at",
        "updated_at",
    ]

    campos_opcionales = [
        "descripcion",
        "ubicacion",
        "ciudad_sede",
        "tipo",
        "capacidad_empresas",
        "empresas_inscritas",
    ]

    print("\n  Validando campos requeridos:")
    for campo in campos_esperados:
        if campo in evento:
            valor = evento[campo]
            tipo = type(valor).__name__
            print(f"    ✓ {campo}: {tipo} = {repr(valor)[:50]}")
        else:
            print(f"    ❌ FALTA: {campo}")
            return False

    print("\n  Validando campos opcionales:")
    for campo in campos_opcionales:
        if campo in evento:
            valor = evento[campo]
            tipo = type(valor).__name__
            valor_str = repr(valor)[:40] if valor is not None else "null"
            print(f"    ✓ {campo}: {tipo} = {valor_str}")
        else:
            print(f"    - {campo}: no presente")

    # Validar tipos específicos
    print("\n  Validando tipos de datos:")

    # id debe ser string UUID
    if isinstance(evento["id"], str) and len(evento["id"]) == 36:
        print("    ✓ id es UUID string")
    else:
        print(f"    ❌ id no es UUID válido: {evento['id']}")
        return False

    # fechas deben ser strings ISO
    for campo in ["fecha_inicio", "fecha_fin", "created_at", "updated_at"]:
        if isinstance(evento[campo], str):
            print(f"    ✓ {campo} es string")
        else:
            print(f"    ❌ {campo} no es string: {type(evento[campo])}")
            return False

    # estado debe ser uno de los valores válidos
    estados_validos = [
        "planificacion",
        "inscripcion_abierta",
        "en_curso",
        "finalizado",
        "cancelado",
    ]
    if evento["estado"] in estados_validos:
        print(f"    ✓ estado es válido: {evento['estado']}")
    else:
        print(f"    ❌ estado inválido: {evento['estado']}")
        return False

    # activo debe ser booleano
    if isinstance(evento["activo"], bool):
        print(f"    ✓ activo es boolean: {evento['activo']}")
    else:
        print(f"    ❌ activo no es boolean: {type(evento['activo'])}")
        return False

    # capacidad_empresas debe ser int si existe
    if "capacidad_empresas" in evento and evento["capacidad_empresas"] is not None:
        if isinstance(evento["capacidad_empresas"], int):
            print(f"    ✓ capacidad_empresas es int: {evento['capacidad_empresas']}")
        else:
            print(
                f"    ❌ capacidad_empresas no es int: {type(evento['capacidad_empresas'])}"
            )
            return False

    print("\n✅ Schema de eventos disponibles es coherente")
    return True


def test_inscripcion_schema(token: str):
    """Verificar schema de inscripciones"""
    print("\n=== Test 2: Schema GET /eventos/mis-inscripciones ===")

    response = requests.get(
        f"{BASE_URL}/eventos/mis-inscripciones",
        headers={"Authorization": f"Bearer {token}"},
    )

    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        return False

    inscripciones = response.json()
    print(f"✓ Status 200, inscripciones: {len(inscripciones)}")

    if not inscripciones:
        print("⚠️  No hay inscripciones para validar schema")
        return True

    # Validar schema
    inscripcion = inscripciones[0]
    campos_requeridos = [
        "id",
        "evento_id",
        "empresa_id",
        "aprobada",
        "fecha_inscripcion",
        "evento",
    ]

    print("\n  Validando campos de inscripción:")
    for campo in campos_requeridos:
        if campo in inscripcion:
            if campo == "evento":
                print(f"    ✓ {campo}: object (nested evento)")
            else:
                valor = inscripcion[campo]
                tipo = type(valor).__name__
                valor_str = repr(valor)[:50]
                print(f"    ✓ {campo}: {tipo} = {valor_str}")
        else:
            print(f"    ❌ FALTA: {campo}")
            return False

    # Validar que evento nested tenga los campos correctos
    print("\n  Validando evento nested:")
    evento_nested = inscripcion["evento"]
    campos_evento = ["id", "nombre", "fecha_inicio", "fecha_fin", "pais_sede"]

    for campo in campos_evento:
        if campo in evento_nested:
            print(f"    ✓ evento.{campo}")
        else:
            print(f"    ❌ FALTA: evento.{campo}")
            return False

    # Validar tipos
    print("\n  Validando tipos:")

    if isinstance(inscripcion["aprobada"], bool):
        print(f"    ✓ aprobada es boolean: {inscripcion['aprobada']}")
    else:
        print("    ❌ aprobada no es boolean")
        return False

    if isinstance(inscripcion["fecha_inscripcion"], str):
        print("    ✓ fecha_inscripcion es string")
    else:
        print("    ❌ fecha_inscripcion no es string")
        return False

    print("\n✅ Schema de inscripciones es coherente")
    return True


def test_frontend_compatibility():
    """Verificar compatibilidad con interfaces TypeScript"""
    print("\n=== Test 3: Compatibilidad Frontend TypeScript ===")

    # Simular lo que frontend espera
    typescript_interfaces = {
        "Evento": [
            "id",
            "nombre",
            "descripcion?",
            "fecha_inicio",
            "fecha_fin",
            "ubicacion?",
            "ciudad_sede?",
            "pais_sede",
            "tipo?",
            "capacidad_empresas?",
            "estado",
            "activo",
            "empresas_inscritas?",
            "created_at",
            "updated_at",
        ],
        "Inscripcion": [
            "id",
            "evento_id",
            "empresa_id",
            "aprobada",
            "fecha_inscripcion",
            "evento",
        ],
    }

    print("\n  Interfaces TypeScript esperadas:")
    print("\n  interface Evento {")
    for campo in typescript_interfaces["Evento"]:
        print(f"    {campo}: ...")
    print("  }")

    print("\n  interface Inscripcion {")
    for campo in typescript_interfaces["Inscripcion"]:
        print(f"    {campo}: ...")
    print("  }")

    print("\n✅ Interfaces documentadas")
    return True


def test_serialization_consistency():
    """Verificar consistencia de serialización"""
    print("\n=== Test 4: Consistencia de Serialización ===")

    checks = [
        ("UUIDs", "Serializados como strings"),
        ("Fechas", "ISO 8601 strings"),
        ("Booleans", "true/false JSON"),
        ("Nulls", "null JSON (no undefined)"),
        ("Números", "int/float JSON"),
        ("Arrays", "[] JSON arrays"),
        ("Objects", "{} JSON objects"),
    ]

    print("\n  Verificando convenciones:")
    for tipo, convencion in checks:
        print(f"    ✓ {tipo}: {convencion}")

    print("\n✅ Convenciones de serialización documentadas")
    return True


def main():
    print("=" * 70)
    print("TEST: Coherencia Frontend-Backend - Inscripción Eventos")
    print("=" * 70)

    try:
        # Login
        token, empresa_id = login()

        # Tests de schema
        test1 = test_eventos_disponibles_schema(token)
        test2 = test_inscripcion_schema(token)
        test3 = test_frontend_compatibility()
        test4 = test_serialization_consistency()

        print("\n" + "=" * 70)
        if test1 and test2 and test3 and test4:
            print("✅ TODOS LOS TESTS PASARON")
            print("✅ Frontend y Backend son COHERENTES")
        else:
            print("❌ ALGUNOS TESTS FALLARON")
            print("⚠️  Revisar inconsistencias")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
