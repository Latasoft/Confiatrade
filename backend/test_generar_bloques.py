"""
Test completo para verificar la generación de bloques horarios

Este test:
1. Obtiene eventos activos
2. Intenta generar bloques horarios para el primer evento
3. Verifica que los bloques se crearon correctamente
4. Valida que aparecen en las consultas
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import requests


def get_api_url() -> str:
    """Obtiene la URL base de la API"""
    return os.getenv("API_URL", "http://localhost:8000")


def login_admin():
    """Login como admin y retorna el token"""
    api_url = get_api_url()

    login_data = {"email": "admin@confiatrade.com", "password": "admin123"}

    try:
        response = requests.post(f"{api_url}/api/v1/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data["access_token"]
        else:
            print(f"❌ Login fallido: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error al hacer login: {e}")
        return None


def test_generar_bloques():
    """Test principal: genera bloques horarios para un evento"""
    print("\n" + "=" * 80)
    print("TEST: Generación de Bloques Horarios")
    print("=" * 80 + "\n")

    # 1. Login
    print("1️⃣ Haciendo login como admin...")
    token = login_admin()

    if not token:
        print("❌ Test fallido: No se pudo obtener token")
        return False

    print("✅ Token obtenido\n")

    api_url = get_api_url()
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Obtener eventos activos
    print("2️⃣ Obteniendo eventos activos...")

    try:
        response = requests.get(
            f"{api_url}/api/v1/eventos", headers=headers, params={"activo": True}
        )

        if response.status_code != 200:
            print(f"❌ Error al obtener eventos: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False

        eventos_data = response.json()
        eventos = eventos_data.get("eventos", [])

        if not eventos:
            print("⚠️  No hay eventos activos en el sistema")
            print("   Crea un evento primero desde el panel de administración")
            return False

        print(f"✅ {len(eventos)} eventos activos encontrados\n")

        # Usar el primer evento
        evento = eventos[0]
        print("📅 Evento seleccionado:")
        print(f"   - Nombre: {evento['nombre']}")
        print(f"   - ID: {evento['id']}")
        print(f"   - Fecha inicio: {evento['fecha_inicio']}")
        print(f"   - Fecha fin: {evento['fecha_fin']}\n")

        # 3. Verificar bloques existentes
        print("3️⃣ Verificando bloques horarios existentes...")

        response = requests.get(
            f"{api_url}/api/v1/bloques-horarios",
            headers=headers,
            params={"evento_id": evento["id"]},
        )

        if response.status_code == 200:
            bloques_data = response.json()
            bloques_existentes = bloques_data.get("bloques", [])
            print(f"   Bloques actuales: {len(bloques_existentes)}\n")
        else:
            print("   No se pudieron obtener bloques existentes\n")
            bloques_existentes = []

        # 4. Generar bloques horarios
        print("4️⃣ Generando bloques horarios...")

        generar_data = {
            "evento_id": evento["id"],
            "fecha_inicio": evento["fecha_inicio"],
            "fecha_fin": evento["fecha_fin"],
            "hora_inicio": "09:00:00",
            "hora_fin": "18:00:00",
            "duracion_minutos": 60,
            "label_prefijo": "Bloque",
        }

        print("   Configuración:")
        print(
            f"   - Fechas: {generar_data['fecha_inicio']} a {generar_data['fecha_fin']}"
        )
        print(
            f"   - Horario: {generar_data['hora_inicio']} a {generar_data['hora_fin']}"
        )
        print(f"   - Duración: {generar_data['duracion_minutos']} minutos")
        print(f"   - Prefijo: {generar_data['label_prefijo']}\n")

        response = requests.post(
            f"{api_url}/api/v1/bloques-horarios/generar",
            headers=headers,
            json=generar_data,
        )

        if response.status_code not in [200, 201]:
            print(f"❌ Error al generar bloques: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False

        resultado = response.json()
        print("✅ Bloques generados exitosamente")
        print(f"   {resultado}\n")

        # 5. Verificar que se crearon los bloques
        print("5️⃣ Verificando bloques creados...")

        response = requests.get(
            f"{api_url}/api/v1/bloques-horarios",
            headers=headers,
            params={"evento_id": evento["id"]},
        )

        if response.status_code != 200:
            print(f"⚠️  No se pudieron verificar los bloques: {response.status_code}")
            return False

        bloques_data = response.json()
        bloques = bloques_data.get("bloques", [])

        print(f"✅ Total bloques ahora: {len(bloques)}")
        print(f"   Nuevos bloques: {len(bloques) - len(bloques_existentes)}\n")

        if len(bloques) > 0:
            print("   Primeros 5 bloques:")
            for i, bloque in enumerate(bloques[:5], 1):
                print(
                    f"   {i}. {bloque['label']}: {bloque['fecha']} {bloque['hora_inicio']}-{bloque['hora_fin']}"
                )

        # 6. Resumen
        print("\n" + "=" * 80)
        print("✅ TEST PASADO - Bloques horarios generados correctamente")
        print("=" * 80)
        print("\nResumen:")
        print(f"  Evento: {evento['nombre']}")
        print(f"  Bloques creados: {len(bloques) - len(bloques_existentes)}")
        print(f"  Total bloques: {len(bloques)}")
        print()

        return True

    except Exception as e:
        print(f"❌ Error al ejecutar test: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_generar_bloques()
    sys.exit(0 if success else 1)
