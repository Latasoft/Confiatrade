"""Use case: Actualizar Reunión"""

from typing import Optional
from uuid import UUID

from core.exceptions import BusinessLogicException, NotFoundException
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository
from repositories.postgres.reunion_repository import ReunionRepository


class ActualizarReunionUseCase:
    """Use case para actualizar reunión"""

    def __init__(
        self,
        reunion_repository: ReunionRepository,
        bloque_repository: BloqueHorarioRepository,
    ):
        self.reunion_repository = reunion_repository
        self.bloque_repository = bloque_repository

    def execute(
        self,
        reunion_id: UUID,
        bloque_id: Optional[int] = None,
        estado: Optional[str] = None,
        notas: Optional[str] = None,
        requiere_interprete: Optional[bool] = None,
        sala: Optional[str] = None,
        resultado: Optional[str] = None,
    ):
        """
        Actualizar reunión con validación:
        - Reunión debe existir
        - Si se cambia el bloque, validar disponibilidad
        - No se permite cambiar empresas
        """
        # Validar que reunión existe
        reunion = self.reunion_repository.get_by_id(reunion_id)
        if not reunion:
            raise NotFoundException(
                message=f"Reunión con ID {reunion_id} no encontrada",
                details={"reunion_id": str(reunion_id)},
            )

        # Si se cambia el bloque, validar disponibilidad
        if bloque_id is not None and bloque_id != reunion.bloque_id:
            # Validar que el nuevo bloque existe y está activo
            nuevo_bloque = self.bloque_repository.get_by_id(bloque_id)
            if not nuevo_bloque:
                raise NotFoundException(
                    message=f"Bloque horario con ID {bloque_id} no encontrado",
                    details={"bloque_id": bloque_id},
                )

            if not nuevo_bloque.activo:
                raise BusinessLogicException(
                    message=f"El bloque {bloque_id} no está activo",
                    details={"bloque_id": bloque_id, "activo": nuevo_bloque.activo},
                )

            # Validar disponibilidad de ambas empresas en el nuevo bloque
            # (excluyendo la reunión actual)
            if not self.reunion_repository.check_empresa_disponible_en_bloque(
                bloque_id, reunion.empresa_a_id, exclude_reunion_id=reunion_id
            ):
                raise BusinessLogicException(
                    message="La empresa A ya tiene una reunión en este bloque",
                    details={
                        "empresa_id": str(reunion.empresa_a_id),
                        "bloque_id": bloque_id,
                    },
                )

            if not self.reunion_repository.check_empresa_disponible_en_bloque(
                bloque_id, reunion.empresa_b_id, exclude_reunion_id=reunion_id
            ):
                raise BusinessLogicException(
                    message="La empresa B ya tiene una reunión en este bloque",
                    details={
                        "empresa_id": str(reunion.empresa_b_id),
                        "bloque_id": bloque_id,
                    },
                )

        # Actualizar
        reunion_actualizada = self.reunion_repository.update(
            reunion_id=reunion_id,
            bloque_id=bloque_id,
            estado=estado,
            notas=notas,
            requiere_interprete=requiere_interprete,
            sala=sala,
            resultado=resultado,
        )

        return reunion_actualizada
