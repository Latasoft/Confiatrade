"""
Script de prueba: Generación y validación de QR
Verifica que el sistema de QR funciona correctamente end-to-end
"""

import json
import uuid

from services.qr_service import generate_unique_qr, validate_qr_data


def test_qr_generation_and_validation():
    print("=" * 60)
    print("PRUEBA: Generación y Validación de QR")
    print("=" * 60)

    # 1. Generar QR de participante
    print("\n1. Generando QR de participante...")
    participante_id = str(uuid.uuid4())
    qr_img_buffer, qr_json = generate_unique_qr(
        tipo="participante",
        entity_id=participante_id,
        evento_id=None,
        include_timestamp=True,
    )

    print(f"   ✅ Participante ID: {participante_id}")
    print(f"   ✅ QR JSON generado: {qr_json}")
    print(f"   ✅ Tamaño imagen QR: {len(qr_img_buffer.getvalue())} bytes")

    # 2. Validar QR generado
    print("\n2. Validando QR generado...")
    qr_data = validate_qr_data(qr_json)

    if qr_data:
        print("   ✅ QR válido!")
        print(f"   - Tipo: {qr_data.get('tipo')}")
        print(f"   - ID: {qr_data.get('id')}")
        print(f"   - Evento ID: {qr_data.get('evento_id')}")
        print(f"   - Timestamp: {qr_data.get('timestamp')}")
    else:
        print("   ❌ QR inválido")
        return False

    # 3. Generar QR de empresa
    print("\n3. Generando QR de empresa...")
    empresa_id = str(uuid.uuid4())
    evento_id = str(uuid.uuid4())
    qr_img_buffer2, qr_json2 = generate_unique_qr(
        tipo="empresa",
        entity_id=empresa_id,
        evento_id=evento_id,
        include_timestamp=True,
    )

    print(f"   ✅ Empresa ID: {empresa_id}")
    print(f"   ✅ Evento ID: {evento_id}")
    print(f"   ✅ QR JSON generado: {qr_json2}")

    # 4. Validar QR empresa
    print("\n4. Validando QR de empresa...")
    qr_data2 = validate_qr_data(qr_json2)

    if qr_data2:
        print("   ✅ QR válido!")
        print(f"   - Tipo: {qr_data2.get('tipo')}")
        print(f"   - ID: {qr_data2.get('id')}")
        print(f"   - Evento ID: {qr_data2.get('evento_id')}")
    else:
        print("   ❌ QR inválido")
        return False

    # 5. Probar QR inválido (manipulado)
    print("\n5. Probando detección de QR manipulado...")
    qr_data_dict = json.loads(qr_json)
    qr_data_dict["id"] = str(uuid.uuid4())  # Cambiar ID sin recalcular hash
    qr_json_manipulado = json.dumps(qr_data_dict, separators=(",", ":"))

    qr_data_invalido = validate_qr_data(qr_json_manipulado)

    if qr_data_invalido is None:
        print("   ✅ Correctamente rechazado QR manipulado (hash inválido)")
    else:
        print("   ❌ ERROR: QR manipulado fue aceptado")
        return False

    # 6. Probar QR con formato incorrecto
    print("\n6. Probando detección de formato incorrecto...")
    qr_json_mal_formato = '{"tipo":"invalido","id":"123"}'
    qr_data_mal_formato = validate_qr_data(qr_json_mal_formato)

    if qr_data_mal_formato is None:
        print("   ✅ Correctamente rechazado QR sin hash")
    else:
        print("   ❌ ERROR: QR sin hash fue aceptado")
        return False

    print("\n" + "=" * 60)
    print("✅ TODAS LAS PRUEBAS PASARON")
    print("=" * 60)
    print("\n📋 EJEMPLOS DE QR PARA PRUEBAS:\n")
    print("Participante QR:")
    print(qr_json)
    print("\nEmpresa QR:")
    print(qr_json2)
    print("\n💡 Puedes copiar estos JSON y pegarlos en el frontend")
    print("   para probar la validación manual.")

    return True


if __name__ == "__main__":
    test_qr_generation_and_validation()
