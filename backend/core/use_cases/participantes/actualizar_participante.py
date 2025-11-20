"""Use case: Actualizar Participante"""

from uuid import UUID

from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from repositories.postgres.participante_repository import ParticipanteRepository


class ActualizarParticipanteUseCase:
    """Use case para actualizar participante"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(
        self,
        participante_id: UUID,
        nombre_completo: str | None = None,
        cargo: str | None = None,
        email: str | None = None,
        telefono: str | None = None,
        idioma: str | None = None,
        requiere_interprete: bool | None = None,
        foto_url: str | None = None,
    ):
        """
        Actualizar participante con validaciones:
        - Participante debe existir
        - Email único por empresa (si se cambia email)
        - Idioma válido
        """
        # 1. Validar que participante existe
        participante = self.participante_repository.get_by_id(participante_id)
        if not participante:
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado",
                details={"participante_id": str(participante_id)},
            )

        # 2. Si se cambia el email, validar que sea único en la empresa
        if email and email != participante.email:
            participante_con_email = (
                self.participante_repository.get_by_email_and_empresa(
                    email, participante.empresa_id
                )
            )
            if participante_con_email:
                raise BusinessLogicException(
                    message=f"Ya existe un participante con email {email} en esta empresa",
                    details={"email": email},
                )

        # 3. Validar idioma si se proporciona
        if idioma:
            idiomas_validos = ["ES", "EN", "PT", "FR"]
            if idioma not in idiomas_validos:
                raise ValidationException(
                    message=f"Idioma {idioma} no válido. Opciones: {', '.join(idiomas_validos)}",
                    details={"idioma": idioma, "opciones_validas": idiomas_validos},
                )

        # 4. Actualizar participante
        participante_actualizado = self.participante_repository.update(
            participante_id=participante_id,
            nombre_completo=nombre_completo,
            cargo=cargo,
            email=email,
            telefono=telefono,
            idioma=idioma,
            requiere_interprete=requiere_interprete,
            foto_url=foto_url,
        )

        return participante_actualizado
