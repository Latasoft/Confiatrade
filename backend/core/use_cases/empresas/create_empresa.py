from datetime import datetime
from uuid import uuid4

from core.entities.empresa import Empresa
from core.interfaces.repositories.empresa_repository import EmpresaRepository


class CreateEmpresa:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(
        self,
        nombre: str,
        pais_id: int,
        sector_id: int,
        descripcion: str = None,
        sitio_web: str = None,
        telefono: str = None,
        email: str = None,
        direccion: str = None,
    ) -> Empresa:
        empresa = Empresa(
            id=uuid4(),
            nombre=nombre,
            pais_id=pais_id,
            sector_id=sector_id,
            descripcion=descripcion,
            sitio_web=sitio_web,
            telefono=telefono,
            email=email,
            direccion=direccion,
            logo_url=None,
            presentacion_url=None,
            aprobada=False,
            fecha_registro=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        return self.repository.create(empresa)
