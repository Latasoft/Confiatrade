from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Participante:
    id: UUID
    empresa_id: UUID
    nombre_completo: str
    cargo: Optional[str]
    email: str
    telefono: Optional[str]
    idioma: str
    requiere_interprete: bool
    foto_url: Optional[str]
    qr_data: Optional[str]
    fecha_registro: datetime
    updated_at: datetime
