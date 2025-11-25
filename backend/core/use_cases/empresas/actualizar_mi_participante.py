"""Use case: Actualizar participante de mi empresa"""

from uuid import UUID

from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from repositories.postgres.participante_repository import ParticipanteRepository


class ActualizarMiParticipanteUseCase:
    """Use case para actualizar participante de la empresa autenticada"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(
        self,
        participante_id: UUID,
        empresa_id: UUID,
        nombre_completo: str | None = None,
        cargo: str | None = None,
        email: str | None = None,
        telefono: str | None = None,
        idioma: str | None = None,
        requiere_interprete: bool | None = None,
    ):
        """
        Actualizar participante validando que pertenezca a la empresa

        Args:
            participante_id: ID del participante a actualizar
            empresa_id: ID de la empresa autenticada
            (resto de campos opcionales para actualizar)

        Returns:
            Participante actualizado

        Raises:
            NotFoundException: Si no existe o no pertenece a la empresa
            BusinessLogicException: Si el nuevo email ya existe
            ValidationException: Si el idioma no es válido
        """
        # Verificar que existe y pertenece a la empresa
        participante = self.participante_repository.get_by_id(participante_id)
        if not participante:
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado",
                details={"participante_id": str(participante_id)},
            )

        if participante.empresa_id != empresa_id:
            raise NotFoundException(
                message="Participante no encontrado en tu empresa",
                details={"participante_id": str(participante_id)},
            )

        # Validar email único si se está cambiando
        if email and email != participante.email:
            existente = self.participante_repository.get_by_email_and_empresa(
                email, empresa_id
            )
            if existente:
                raise BusinessLogicException(
                    message=f"Ya existe otro participante con email {email} en tu empresa",
                    details={"email": email},
                )

        # Validar idioma si se proporciona
        if idioma:
            idiomas_validos = ["ES", "EN", "PT", "FR"]
            if idioma not in idiomas_validos:
                raise ValidationException(
                    message=f"Idioma {idioma} no válido. Opciones: {', '.join(idiomas_validos)}",
                    details={"idioma": idioma, "opciones_validas": idiomas_validos},
                )

        # Actualizar participante
        participante_actualizado = self.participante_repository.update(
            participante_id=participante_id,
            nombre_completo=nombre_completo,
            cargo=cargo,
            email=email,
            telefono=telefono,
            idioma=idioma,
            requiere_interprete=requiere_interprete,
        )

        return participante_actualizado
