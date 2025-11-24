"""
Script de prueba para endpoints de subida de presentación PDF

Prueba:
1. Login como empresa
2. Subir PDF de presentación
3. Verificar que se guardó correctamente
4. Verificar URL de acceso
"""

import os
import sys
from io import BytesIO

import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Configuración
BASE_URL = "http://localhost:8000/api/v1"
TEST_EMPRESA_EMAIL = "h.murakami@gmail.com"
TEST_EMPRESA_PASSWORD = "haruki123"


def create_test_pdf() -> BytesIO:
    """Crear un PDF de prueba en memoria"""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)

    # Contenido del PDF
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 750, "Presentación de Empresa")

    c.setFont("Helvetica", 12)
    c.drawString(
        100, 700, "Esta es una presentación de prueba generada automáticamente."
    )
    c.drawString(100, 680, "Contenido de ejemplo para testing del sistema de uploads.")

    c.drawString(100, 640, "Sección 1: Sobre la empresa")
    c.drawString(120, 620, "- Descripción de servicios")
    c.drawString(120, 600, "- Experiencia en el sector")

    c.drawString(100, 560, "Sección 2: Productos")
    c.drawString(120, 540, "- Catálogo de productos")
    c.drawString(120, 520, "- Especificaciones técnicas")

    c.drawString(100, 480, "Sección 3: Contacto")
    c.drawString(120, 460, "- Email: contacto@empresa.com")
    c.drawString(120, 440, "- Teléfono: +1234567890")

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer


def test_login():
    """Hacer login y retornar token"""
    print("=== Test 1: Login como empresa ===")

    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": TEST_EMPRESA_EMAIL, "password": TEST_EMPRESA_PASSWORD},
    )

    if response.status_code != 200:
        print(f"❌ Error en login: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        sys.exit(1)

    data = response.json()
    token = data["access_token"]

    # Verificar estructura de respuesta
    print(f"   Estructura de respuesta: {list(data.keys())}")

    if "empresa" in data:
        empresa_id = data["empresa"]["id"]
        empresa_nombre = data["empresa"]["nombre"]
    else:
        # Obtener ID de empresa del perfil
        headers = {"Authorization": f"Bearer {token}"}
        perfil_response = requests.get(f"{BASE_URL}/auth/perfil", headers=headers)
        perfil_data = perfil_response.json()

        if "empresa" not in perfil_data or perfil_data["empresa"] is None:
            print("❌ Usuario no tiene empresa asociada")
            print(f"   Perfil: {perfil_data}")
            sys.exit(1)

        empresa_id = perfil_data["empresa"]["id"]
        empresa_nombre = perfil_data["empresa"]["nombre"]

    print("✅ Login exitoso")
    print(f"   Empresa: {empresa_nombre} (ID: {empresa_id})")
    print(f"   Token obtenido: {token[:20]}...")

    return token, empresa_id


def test_upload_presentacion(token: str, empresa_id: str):
    """Subir PDF de presentación"""
    print("\n=== Test 2: Subir PDF de presentación ===")

    # Crear PDF de prueba
    pdf_buffer = create_test_pdf()
    pdf_size = len(pdf_buffer.getvalue())
    print(f"   PDF generado: {pdf_size} bytes")

    # Preparar archivo para upload
    files = {"file": ("presentacion_test.pdf", pdf_buffer, "application/pdf")}

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.post(
        f"{BASE_URL}/empresas/{empresa_id}/presentacion", files=files, headers=headers
    )

    if response.status_code != 200:
        print(f"❌ Error en upload: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        return None

    data = response.json()
    presentacion_url = data.get("presentacion_url")

    print("✅ Upload exitoso")
    print(f"   URL guardada: {presentacion_url}")

    return presentacion_url


def test_verify_file_exists(presentacion_url: str):
    """Verificar que el archivo existe en el servidor"""
    print("\n=== Test 3: Verificar archivo guardado ===")

    if not presentacion_url:
        print("❌ No hay URL para verificar")
        return False

    # Extraer ruta relativa
    # URL ejemplo: http://localhost:8000/uploads/presentaciones/presentacion_xxx.pdf
    if "/uploads/" in presentacion_url:
        relative_path = presentacion_url.split("/uploads/")[1]
        file_path = os.path.join("uploads", relative_path)

        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print("✅ Archivo existe en disco")
            print(f"   Ruta: {file_path}")
            print(f"   Tamaño: {file_size} bytes")
            return True
        else:
            print("❌ Archivo NO existe en disco")
            print(f"   Ruta esperada: {file_path}")
            return False
    else:
        print(f"❌ URL no tiene formato esperado: {presentacion_url}")
        return False


def test_download_file(presentacion_url: str):
    """Intentar descargar el archivo desde la URL"""
    print("\n=== Test 4: Descargar archivo desde URL ===")

    if not presentacion_url:
        print("❌ No hay URL para descargar")
        return False

    try:
        response = requests.get(presentacion_url)

        if response.status_code == 200:
            content_type = response.headers.get("Content-Type", "")
            content_length = len(response.content)

            print("✅ Descarga exitosa")
            print(f"   Content-Type: {content_type}")
            print(f"   Tamaño descargado: {content_length} bytes")

            # Verificar que es PDF
            if content_type == "application/pdf" or response.content.startswith(
                b"%PDF"
            ):
                print("✅ Archivo es un PDF válido")
                return True
            else:
                print(f"⚠️  Content-Type no es PDF: {content_type}")
                return False
        else:
            print(f"❌ Error al descargar: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Excepción al descargar: {str(e)}")
        return False


def test_upload_invalid_file(token: str, empresa_id: str):
    """Intentar subir archivo no-PDF (debe fallar)"""
    print("\n=== Test 5: Intentar subir archivo no-PDF (debe fallar) ===")

    # Crear archivo de texto
    text_content = b"Este no es un PDF"

    files = {"file": ("documento.txt", BytesIO(text_content), "text/plain")}

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.post(
        f"{BASE_URL}/empresas/{empresa_id}/presentacion", files=files, headers=headers
    )

    if response.status_code == 400:
        error_detail = response.json().get("detail", "")
        print("✅ Validación funcionó correctamente")
        print(f"   Error esperado: {error_detail}")
        return True
    else:
        print(f"❌ Debería haber rechazado el archivo (status: {response.status_code})")
        return False


def test_upload_large_file(token: str, empresa_id: str):
    """Intentar subir archivo muy grande (debe fallar)"""
    print("\n=== Test 6: Intentar subir archivo >5MB (debe fallar) ===")

    # Crear PDF grande (6MB)
    large_buffer = BytesIO()
    large_buffer.write(b"%PDF-1.4\n")
    large_buffer.write(b"X" * (6 * 1024 * 1024))  # 6MB de datos
    large_buffer.seek(0)

    files = {"file": ("presentacion_grande.pdf", large_buffer, "application/pdf")}

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.post(
        f"{BASE_URL}/empresas/{empresa_id}/presentacion", files=files, headers=headers
    )

    if response.status_code == 400:
        error_detail = response.json().get("detail", "")
        print("✅ Validación de tamaño funcionó")
        print(f"   Error esperado: {error_detail}")
        return True
    else:
        print(
            f"❌ Debería haber rechazado archivo grande (status: {response.status_code})"
        )
        return False


def test_reupload_presentacion(token: str, empresa_id: str):
    """Re-subir presentación (debe sobrescribir)"""
    print("\n=== Test 7: Re-subir presentación (actualización) ===")

    # Crear nuevo PDF
    pdf_buffer = create_test_pdf()

    files = {"file": ("presentacion_actualizada.pdf", pdf_buffer, "application/pdf")}

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.post(
        f"{BASE_URL}/empresas/{empresa_id}/presentacion", files=files, headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        new_url = data.get("presentacion_url")
        print("✅ Re-upload exitoso")
        print(f"   Nueva URL: {new_url}")
        return True
    else:
        print(f"❌ Error en re-upload: {response.status_code}")
        return False


def main():
    print("=" * 70)
    print("TEST: Sistema de Upload de Presentaciones PDF")
    print("=" * 70)
    print()

    try:
        # Test 1: Login
        token, empresa_id = test_login()

        # Test 2: Upload inicial
        presentacion_url = test_upload_presentacion(token, empresa_id)

        # Test 3: Verificar archivo en disco
        test_verify_file_exists(presentacion_url)

        # Test 4: Descargar archivo
        test_download_file(presentacion_url)

        # Test 5: Validación tipo de archivo
        test_upload_invalid_file(token, empresa_id)

        # Test 6: Validación tamaño
        test_upload_large_file(token, empresa_id)

        # Test 7: Re-upload
        test_reupload_presentacion(token, empresa_id)

        print("\n" + "=" * 70)
        print("✅ TODOS LOS TESTS COMPLETADOS")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ ERROR GENERAL: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
