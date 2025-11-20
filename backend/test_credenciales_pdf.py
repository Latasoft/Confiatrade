"""Script de prueba para verificar generación de PDFs de credenciales"""

import uuid

from services.pdf_generator import PDFCredencialGenerator
from services.qr_service import generate_unique_qr, validate_qr_data


def test_qr_generation():
    """Probar generación y validación de QR"""
    print("\n=== Test QR Generation ===")

    test_id = str(uuid.uuid4())
    qr_buffer, qr_json = generate_unique_qr(
        tipo="empresa", entity_id=test_id, evento_id=None, include_timestamp=True
    )

    print(f"✓ QR generado (tamaño: {len(qr_buffer.getvalue())} bytes)")
    print(f"✓ Datos QR: {qr_json[:100]}...")

    # Validar QR
    qr_data = validate_qr_data(qr_json)
    assert qr_data is not None, "QR validation failed"
    assert qr_data["tipo"] == "empresa", "Tipo incorrecto"
    assert qr_data["id"] == test_id, "ID incorrecto"
    print("✓ QR validado correctamente")


def test_pdf_empresa():
    """Probar generación de PDF para empresa"""
    print("\n=== Test PDF Empresa ===")

    generator = PDFCredencialGenerator()
    test_id = str(uuid.uuid4())

    _, qr_json = generate_unique_qr("empresa", test_id, None, True)

    pdf_buffer = generator.generar_badge_empresa(
        empresa_nombre="Acme Corporation S.A.",
        empresa_email="contacto@acme.com",
        empresa_pais="Colombia",
        empresa_sector="Tecnología",
        qr_data_json=qr_json,
        formato="badge",
    )

    pdf_size = len(pdf_buffer.getvalue())
    print(f"✓ PDF empresa generado (tamaño: {pdf_size} bytes)")
    assert pdf_size > 1000, "PDF demasiado pequeño"

    # Guardar para inspección manual
    with open("test_credencial_empresa.pdf", "wb") as f:
        f.write(pdf_buffer.getvalue())
    print("✓ PDF guardado: test_credencial_empresa.pdf")


def test_pdf_participante():
    """Probar generación de PDF para participante"""
    print("\n=== Test PDF Participante ===")

    generator = PDFCredencialGenerator()
    test_id = str(uuid.uuid4())

    _, qr_json = generate_unique_qr("participante", test_id, None, True)

    pdf_buffer = generator.generar_badge_participante(
        participante_nombre="Juan Pérez García",
        participante_cargo="Director de Operaciones",
        participante_email="juan.perez@acme.com",
        empresa_nombre="Acme Corporation S.A.",
        qr_data_json=qr_json,
        formato="badge",
    )

    pdf_size = len(pdf_buffer.getvalue())
    print(f"✓ PDF participante generado (tamaño: {pdf_size} bytes)")
    assert pdf_size > 1000, "PDF demasiado pequeño"

    # Guardar para inspección manual
    with open("test_credencial_participante.pdf", "wb") as f:
        f.write(pdf_buffer.getvalue())
    print("✓ PDF guardado: test_credencial_participante.pdf")


def test_formato_lanyard():
    """Probar formato lanyard"""
    print("\n=== Test Formato Lanyard ===")

    generator = PDFCredencialGenerator()
    test_id = str(uuid.uuid4())

    _, qr_json = generate_unique_qr("empresa", test_id, None, True)

    pdf_buffer = generator.generar_badge_empresa(
        empresa_nombre="Tech Solutions LATAM",
        empresa_email="info@techsolutions.com",
        empresa_pais="México",
        empresa_sector="Software",
        qr_data_json=qr_json,
        formato="lanyard",
    )

    pdf_size = len(pdf_buffer.getvalue())
    print(f"✓ PDF lanyard generado (tamaño: {pdf_size} bytes)")

    with open("test_credencial_lanyard.pdf", "wb") as f:
        f.write(pdf_buffer.getvalue())
    print("✓ PDF guardado: test_credencial_lanyard.pdf")


if __name__ == "__main__":
    print("=" * 60)
    print("TEST: Sistema de Credenciales Profesionales")
    print("=" * 60)

    try:
        test_qr_generation()
        test_pdf_empresa()
        test_pdf_participante()
        test_formato_lanyard()

        print("\n" + "=" * 60)
        print("✓ TODOS LOS TESTS PASARON")
        print("=" * 60)
        print("\nArchivos generados:")
        print("  - test_credencial_empresa.pdf")
        print("  - test_credencial_participante.pdf")
        print("  - test_credencial_lanyard.pdf")

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback

        traceback.print_exc()
