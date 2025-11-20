"""Servicio para generación de códigos QR únicos"""

import hashlib
import json
from datetime import datetime
from io import BytesIO

import qrcode
from qrcode.image.pil import PilImage


def generate_unique_qr(
    tipo: str,  # 'empresa' o 'participante'
    entity_id: str,
    evento_id: str | None = None,
    include_timestamp: bool = True,
) -> tuple[BytesIO, str]:
    """
    Genera un código QR único con información estructurada.

    Args:
        tipo: Tipo de entidad ('empresa' o 'participante')
        entity_id: ID de la empresa o participante
        evento_id: ID del evento (opcional)
        include_timestamp: Si incluir timestamp en el QR

    Returns:
        Tuple con (buffer del QR en bytes, data JSON del QR como string)
    """
    # Crear estructura de datos para el QR
    qr_data = {
        "tipo": tipo,
        "id": str(entity_id),
        "evento_id": str(evento_id) if evento_id else None,
    }

    if include_timestamp:
        qr_data["timestamp"] = datetime.utcnow().isoformat()

    # Serializar a JSON
    qr_json = json.dumps(qr_data, separators=(",", ":"))

    # Generar hash para verificación
    data_hash = hashlib.sha256(qr_json.encode()).hexdigest()[:16]
    qr_data["hash"] = data_hash

    # Volver a serializar con el hash
    qr_json_final = json.dumps(qr_data, separators=(",", ":"))

    # Crear QR code con alta corrección de errores
    qr = qrcode.QRCode(
        version=None,  # Auto-ajustar tamaño
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Máxima corrección
        box_size=10,
        border=2,
    )

    qr.add_data(qr_json_final)
    qr.make(fit=True)

    # Generar imagen
    qr_img = qr.make_image(
        fill_color="black", back_color="white", image_factory=PilImage
    )

    # Guardar en buffer
    img_buffer = BytesIO()
    qr_img.save(img_buffer, format="PNG")
    img_buffer.seek(0)

    return img_buffer, qr_json_final


def validate_qr_data(qr_json: str) -> dict | None:
    """
    Valida y parsea los datos de un QR code.

    Args:
        qr_json: String JSON del QR code

    Returns:
        Diccionario con los datos si es válido, None si inválido
    """
    try:
        data = json.loads(qr_json)

        # Validar campos requeridos
        if "tipo" not in data or "id" not in data or "hash" not in data:
            return None

        # Validar tipo
        if data["tipo"] not in ["empresa", "participante"]:
            return None

        # Extraer hash y recalcular
        stored_hash = data.pop("hash")
        recalculated_json = json.dumps(data, separators=(",", ":"))
        recalculated_hash = hashlib.sha256(recalculated_json.encode()).hexdigest()[:16]

        # Validar hash
        if stored_hash != recalculated_hash:
            return None

        # Restaurar hash en data
        data["hash"] = stored_hash

        return data

    except (json.JSONDecodeError, KeyError):
        return None


def generate_qr_image_for_pdf(
    qr_data_json: str,
    size: int = 300,
) -> BytesIO:
    """
    Genera una imagen QR optimizada para incluir en PDFs.

    Args:
        qr_data_json: String JSON con los datos del QR
        size: Tamaño del QR en píxeles

    Returns:
        Buffer con la imagen PNG
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=size // 30,  # Ajustar box_size basado en el tamaño deseado
        border=2,
    )

    qr.add_data(qr_data_json)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white", image_factory=PilImage)

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer
