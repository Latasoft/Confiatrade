"""Use case: Crear participante en mi empresa"""

from uuid import UUID

from core.exceptions import BusinessLogicException, ValidationException
from repositories.postgres.participante_repository import ParticipanteRepository
from services.qr_service import generate_unique_qr


class CrearMiParticipanteUseCase:
    """Use case para que una empresa cree un participante en su propia organización"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(
        self,
        empresa_id: UUID,
        nombre_completo: str,
        email: str,
        cargo: str | None = None,
        telefono: str | None = None,
        idioma: str = "ES",
        requiere_interprete: bool = False,
    ):
        """
        Crear participante para la empresa autenticada

        Args:
            empresa_id: ID de la empresa (viene del token JWT)
            nombre_completo: Nombre completo del participante
            email: Email único por empresa
            cargo: Cargo en la empresa
            telefono: Teléfono de contacto
            idioma: Código de idioma (ES, EN, PT, FR)
            requiere_interprete: Si necesita intérprete
            foto_url: URL de la foto

        Returns:
            Participante creado con QR generado

        Raises:
            BusinessLogicException: Si el email ya existe en la empresa
            ValidationException: Si el idioma no es válido
        """
        # Validar email único por empresa
        participante_existente = self.participante_repository.get_by_email_and_empresa(
            email, empresa_id
        )
        if participante_existente:
            raise BusinessLogicException(
                message=f"Ya existe un participante con email {email} en tu empresa",
                details={"email": email},
            )

        # Validar idioma
        idiomas_validos = ["ES", "EN", "PT", "FR"]
        if idioma not in idiomas_validos:
            raise ValidationException(
                message=f"Idioma {idioma} no válido. Opciones: {', '.join(idiomas_validos)}",
                details={"idioma": idioma, "opciones_validas": idiomas_validos},
            )

        # Crear participante primero sin qr_data para obtener el ID
        participante = self.participante_repository.create(
            empresa_id=empresa_id,
            nombre_completo=nombre_completo,
            email=email,
            cargo=cargo,
            telefono=telefono,
            idioma=idioma,
            requiere_interprete=requiere_interprete,
            qr_data=None,  # Temporal
        )

        # Generar QR único con el ID del participante
        _, qr_data_json = generate_unique_qr(
            tipo="participante",
            entity_id=str(participante.id),
            evento_id=None,  # Se puede agregar después si se requiere
            include_timestamp=True,
        )

        # Actualizar con el qr_data correcto
        participante = self.participante_repository.update(
            participante.id, qr_data=qr_data_json
        )

        return participante
