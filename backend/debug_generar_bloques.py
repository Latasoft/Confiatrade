"""
Script simple para debugging rápido de generación de bloques

Úsalo con parámetros personalizados para probar diferentes escenarios.
"""

import os
import sys
from datetime import date

import requests

# Configuración
API_URL = os.getenv("API_URL", "http://localhost:8000")
ADMIN_EMAIL = "admin@confiatrade.com"
ADMIN_PASSWORD = "admin123"


def login():
    """Login y obtener token"""
    response = requests.post(
        f"{API_URL}/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )

    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login fallido: {response.status_code}")
        print(f"   Response: {response.text}")
        return None


def debug_generar_bloques(
    evento_id: str,
    fecha_inicio: str = None,
    fecha_fin: str = None,
    hora_inicio: str = "09:00:00",
    hora_fin: str = "18:00:00",
    duracion_minutos: int = 60,
    label_prefijo: str = "Bloque",
):
    """
    Genera bloques con debugging completo

    Args:
        evento_id: UUID del evento (requerido)
        fecha_inicio: "YYYY-MM-DD" (default: hoy)
        fecha_fin: "YYYY-MM-DD" (default: hoy)
        hora_inicio: "HH:MM:SS" (default: 09:00:00)
        hora_fin: "HH:MM:SS" (default: 18:00:00)
        duracion_minutos: int (default: 60)
        label_prefijo: str (default: "Bloque")
    """

    # Defaults para fechas
    if not fecha_inicio:
        fecha_inicio = date.today().isoformat()
    if not fecha_fin:
        fecha_fin = fecha_inicio

    print("\n" + "=" * 80)
    print("DEBUG: Generación de Bloques Horarios")
    print("=" * 80 + "\n")

    # 1. Login
    print("1️⃣ Obteniendo token...")
    token = login()
    if not token:
        return False
    print("   ✅ Token obtenido\n")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verificar que el evento existe
    print(f"2️⃣ Verificando evento {evento_id}...")

    response = requests.get(f"{API_URL}/api/v1/eventos/{evento_id}", headers=headers)

    if response.status_code != 200:
        print(f"   ❌ Evento no encontrado: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

    evento = response.json()
    print(f"   ✅ Evento encontrado: {evento['nombre']}")
    print(f"   - Fecha inicio: {evento['fecha_inicio']}")
    print(f"   - Fecha fin: {evento['fecha_fin']}\n")

    # 3. Preparar request
    print("3️⃣ Preparando request...")

    request_data = {
        "evento_id": evento_id,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "hora_inicio": hora_inicio,
        "hora_fin": hora_fin,
        "duracion_minutos": duracion_minutos,
        "label_prefijo": label_prefijo,
    }

    print("   Request body:")
    for key, value in request_data.items():
        print(f"   - {key}: {value}")
    print()

    # 4. Enviar request
    print("4️⃣ Enviando request a /api/v1/bloques-horarios/generar...")

    try:
        response = requests.post(
            f"{API_URL}/api/v1/bloques-horarios/generar",
            headers=headers,
            json=request_data,
        )

        print(f"   Status Code: {response.status_code}")
        print("   Response:\n")

        try:
            response_json = response.json()
            import json

            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)

        print()

        if response.status_code in [200, 201]:
            print("   ✅ Bloques generados exitosamente\n")

            # 5. Verificar bloques creados
            print("5️⃣ Verificando bloques en BD...")

            response = requests.get(
                f"{API_URL}/api/v1/bloques-horarios",
                headers=headers,
                params={"evento_id": evento_id},
            )

            if response.status_code == 200:
                bloques_data = response.json()
                bloques = bloques_data.get("bloques", [])

                print(f"   Total bloques en BD: {len(bloques)}")

                if bloques:
                    print("\n   Primeros 10 bloques:")
                    for i, bloque in enumerate(bloques[:10], 1):
                        print(
                            f"   {i}. {bloque['label']}: {bloque['fecha']} {bloque['hora_inicio']}-{bloque['hora_fin']}"
                        )

                print()

            return True
        else:
            print("   ❌ Error al generar bloques\n")
            return False

    except Exception as e:
        print(f"   ❌ Exception: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n🔧 DEBUG TOOL: Generación de Bloques Horarios")
    print("=" * 80)

    # Ejemplo de uso
    if len(sys.argv) < 2:
        print(
            "\n❌ Uso: python debug_generar_bloques.py <evento_id> [fecha_inicio] [fecha_fin]"
        )
        print("\nEjemplo:")
        print(
            '  python debug_generar_bloques.py "12345678-1234-1234-1234-123456789012"'
        )
        print(
            '  python debug_generar_bloques.py "12345678-1234-1234-1234-123456789012" "2025-01-15" "2025-01-17"'
        )
        print()
        print("Para obtener un evento_id válido, ejecuta primero:")
        print("  python test_generar_bloques.py")
        print()
        sys.exit(1)

    evento_id = sys.argv[1]
    fecha_inicio = sys.argv[2] if len(sys.argv) > 2 else None
    fecha_fin = sys.argv[3] if len(sys.argv) > 3 else None

    success = debug_generar_bloques(
        evento_id=evento_id, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin
    )

    sys.exit(0 if success else 1)
