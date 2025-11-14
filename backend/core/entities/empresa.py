from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Empresa:
    id: UUID
    nombre: str
    pais_id: int
    sector_id: int
    descripcion: Optional[str]
    sitio_web: Optional[str]
    telefono: Optional[str]
    email: Optional[str]
    direccion: Optional[str]
    logo_url: Optional[str]
    aprobada: bool
    fecha_registro: datetime
    updated_at: datetime

    def aprobar(self) -> None:
        self.aprobada = True

    def rechazar(self) -> None:
        self.aprobada = False
