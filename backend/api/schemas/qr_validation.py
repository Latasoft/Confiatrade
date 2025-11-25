"""Schemas para validación de QR"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class QRDataRequest(BaseModel):
    """Request con datos del QR escaneado"""

    qr_json: str  # JSON string del QR escaneado


class QRValidacionResponse(BaseModel):
    """Response de validación de QR"""

    valido: bool
    razon: Optional[str] = None  # Razón si es inválido
    tipo: Optional[str] = None  # 'empresa' o 'participante'
    entity_id: Optional[UUID] = None
    evento_id: Optional[UUID] = None
    timestamp: Optional[datetime] = None

    # Datos de la entidad si es válido
    nombre: Optional[str] = None
    email: Optional[str] = None
    empresa_nombre: Optional[str] = None  # Solo para participantes
    aprobada: Optional[bool] = None
    telefono: Optional[str] = None
    pais_nombre: Optional[str] = None
    sector_nombre: Optional[str] = None


class QRCheckInRequest(BaseModel):
    """Request para hacer check-in desde QR"""

    qr_json: str
    evento_id: Optional[UUID] = None  # Opcional, puede venir del QR


class QRCheckInResponse(BaseModel):
    """Response de check-in desde QR"""

    success: bool
    message: str
    participante_id: Optional[UUID] = None
    participante_nombre: Optional[str] = None
    empresa_nombre: Optional[str] = None
    ya_registrado: bool = False
    fecha_check_in: Optional[datetime] = None
