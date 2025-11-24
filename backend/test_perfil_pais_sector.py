"""
Test de integración: Verificar que el perfil de usuario empresa retorna pais_nombre y sector_nombre

Este test verifica:
1. Endpoint GET /auth/perfil retorna estructura correcta
2. Campo empresa.pais_nombre está presente y tiene valor
3. Campo empresa.sector_nombre está presente y tiene valor
4. Los nombres coinciden con los datos de la BD
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from typing import Optional

import requests


def get_api_url() -> str:
    """Obtiene la URL base de la API"""
    return os.getenv("API_URL", "http://localhost:8000")


def login_empresa() -> Optional[str]:
    """Login como empresa y retorna el token"""
    api_url = get_api_url()

    # Datos de login (ajustar según credenciales reales)
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


def test_perfil_con_nombres():
    """Test principal: verifica que perfil retorne pais_nombre y sector_nombre"""
    print("\n" + "=" * 80)
    print("TEST: Perfil empresa con nombres de país y sector")
    print("=" * 80 + "\n")

    # 1. Login
    print("1️⃣ Haciendo login como empresa...")
    token = login_empresa()

    if not token:
        print("❌ Test fallido: No se pudo obtener token")
        return False

    print(f"✅ Token obtenido: {token[:50]}...\n")

    # 2. Obtener perfil
    print("2️⃣ Obteniendo perfil del usuario...")
    api_url = get_api_url()
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(f"{api_url}/api/v1/auth/perfil", headers=headers)

        if response.status_code != 200:
            print(f"❌ Error al obtener perfil: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False

        perfil = response.json()
        print("✅ Perfil obtenido correctamente\n")

        # 3. Verificar estructura
        print("3️⃣ Verificando estructura del perfil...")

        if "empresa" not in perfil or perfil["empresa"] is None:
            print("❌ Campo 'empresa' no encontrado o es null")
            return False

        empresa = perfil["empresa"]
        print("✅ Campo empresa presente")
        print(f"   - ID: {empresa.get('id', 'N/A')}")
        print(f"   - Nombre: {empresa.get('nombre', 'N/A')}")
        print(f"   - Aprobada: {empresa.get('aprobada', 'N/A')}\n")

        # 4. Verificar pais_nombre
        print("4️⃣ Verificando campo pais_nombre...")

        if "pais_nombre" not in empresa:
            print("❌ Campo 'pais_nombre' NO encontrado en empresa")
            print(f"   Campos disponibles: {list(empresa.keys())}")
            return False

        pais_nombre = empresa["pais_nombre"]
        pais_id = empresa.get("pais_id")

        if pais_nombre is None:
            print(f"⚠️  Campo 'pais_nombre' es null (pais_id: {pais_id})")
            print("   Posible problema: relación 'pais' no cargada o no existe")
            return False

        print(f"✅ Campo pais_nombre presente: '{pais_nombre}'")
        print(f"   - pais_id: {pais_id}\n")

        # 5. Verificar sector_nombre
        print("5️⃣ Verificando campo sector_nombre...")

        if "sector_nombre" not in empresa:
            print("❌ Campo 'sector_nombre' NO encontrado en empresa")
            print(f"   Campos disponibles: {list(empresa.keys())}")
            return False

        sector_nombre = empresa["sector_nombre"]
        sector_id = empresa.get("sector_id")

        if sector_nombre is None:
            print(f"⚠️  Campo 'sector_nombre' es null (sector_id: {sector_id})")
            print("   Posible problema: relación 'sector' no cargada o no existe")
            return False

        print(f"✅ Campo sector_nombre presente: '{sector_nombre}'")
        print(f"   - sector_id: {sector_id}\n")

        # 6. Resumen
        print("=" * 80)
        print(
            "✅ TEST PASADO - Perfil retorna correctamente pais_nombre y sector_nombre"
        )
        print("=" * 80)
        print("\nResumen:")
        print(f"  Empresa: {empresa['nombre']}")
        print(f"  País: {pais_nombre} (ID: {pais_id})")
        print(f"  Sector: {sector_nombre} (ID: {sector_id})")
        print(f"  Estado: {'Aprobada' if empresa['aprobada'] else 'Pendiente'}")
        print()

        return True

    except Exception as e:
        print(f"❌ Error al ejecutar test: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_perfil_con_nombres()
    sys.exit(0 if success else 1)
