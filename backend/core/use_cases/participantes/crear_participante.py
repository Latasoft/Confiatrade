"""Use case: Crear Participante"""

import secrets
from uuid import UUID

from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from repositories.postgres.empresa_repository import EmpresaRepository
from repositories.postgres.participante_repository import ParticipanteRepository


class CrearParticipanteUseCase:
    """Use case para crear participante con validaciones"""

    def __init__(
        self,
        participante_repository: ParticipanteRepository,
        empresa_repository: EmpresaRepository,
    ):
        self.participante_repository = participante_repository
        self.empresa_repository = empresa_repository

    def execute(
        self,
        empresa_id: UUID,
        nombre_completo: str,
        email: str,
        cargo: str | None = None,
        telefono: str | None = None,
        idioma: str = "ES",
        requiere_interprete: bool = False,
        foto_url: str | None = None,
    ):
        """
        Crear participante con validaciones:
        - Empresa debe existir
        - Email único por empresa
        - Generar QR automáticamente
        """
        # 1. Validar que empresa existe
        empresa = self.empresa_repository.get_by_id(empresa_id)
        if not empresa:
            raise NotFoundException(
                message=f"Empresa con ID {empresa_id} no encontrada",
                details={"empresa_id": str(empresa_id)},
            )

        # 2. Validar email único por empresa
        participante_existente = self.participante_repository.get_by_email_and_empresa(
            email, empresa_id
        )
        if participante_existente:
            raise BusinessLogicException(
                message=f"Ya existe un participante con email {email} en esta empresa",
                details={"email": email, "empresa_id": str(empresa_id)},
            )

        # 3. Validar idioma
        idiomas_validos = ["ES", "EN", "PT", "FR"]
        if idioma not in idiomas_validos:
            raise ValidationException(
                message=f"Idioma {idioma} no válido. Opciones: {', '.join(idiomas_validos)}",
                details={"idioma": idioma, "opciones_validas": idiomas_validos},
            )

        # 4. Generar QR único (token seguro)
        qr_data = secrets.token_urlsafe(32)

        # 5. Crear participante
        participante = self.participante_repository.create(
            empresa_id=empresa_id,
            nombre_completo=nombre_completo,
            email=email,
            cargo=cargo,
            telefono=telefono,
            idioma=idioma,
            requiere_interprete=requiere_interprete,
            foto_url=foto_url,
            qr_data=qr_data,
        )

        return participante
