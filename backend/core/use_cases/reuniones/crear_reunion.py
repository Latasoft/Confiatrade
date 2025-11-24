"""Use case: Crear Reunión"""

from typing import Optional
from uuid import UUID

from core.exceptions import (
    BusinessLogicException,
    NotFoundException,
    ValidationException,
)
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository
from repositories.postgres.empresa_evento_repository import EmpresaEventoRepository
from repositories.postgres.empresa_repository import PostgresEmpresaRepository
from repositories.postgres.reunion_repository import ReunionRepository


class CrearReunionUseCase:
    """Use case para crear reunión con validaciones complejas"""

    def __init__(
        self,
        reunion_repository: ReunionRepository,
        empresa_repository: PostgresEmpresaRepository,
        bloque_repository: BloqueHorarioRepository,
        empresa_evento_repository: EmpresaEventoRepository,
    ):
        self.reunion_repository = reunion_repository
        self.empresa_repository = empresa_repository
        self.bloque_repository = bloque_repository
        self.empresa_evento_repository = empresa_evento_repository

    def execute(
        self,
        bloque_id: int,
        empresa_a_id: UUID,
        empresa_b_id: UUID,
        estado: str = "programada",
        notas: Optional[str] = None,
        requiere_interprete: bool = False,
        sala: Optional[str] = None,
        resultado: Optional[str] = None,
    ):
        """
        Crear reunión con validaciones:
        1. empresa_a_id != empresa_b_id
        2. Ambas empresas deben existir
        3. Bloque debe existir y estar activo
        4. Ambas empresas deben estar disponibles en el bloque (sin otra reunión)
        5. Si el bloque tiene evento_id, ambas empresas deben estar inscritas en ese evento
        """
        # 1. Validar empresas distintas
        if empresa_a_id == empresa_b_id:
            raise ValidationException(
                message="Una empresa no puede tener reunión consigo misma",
                details={
                    "empresa_a_id": str(empresa_a_id),
                    "empresa_b_id": str(empresa_b_id),
                },
            )

        # 2. Validar que ambas empresas existen
        empresa_a = self.empresa_repository.get_by_id(empresa_a_id)
        if not empresa_a:
            raise NotFoundException(
                message=f"Empresa A con ID {empresa_a_id} no encontrada",
                details={"empresa_a_id": str(empresa_a_id)},
            )

        empresa_b = self.empresa_repository.get_by_id(empresa_b_id)
        if not empresa_b:
            raise NotFoundException(
                message=f"Empresa B con ID {empresa_b_id} no encontrada",
                details={"empresa_b_id": str(empresa_b_id)},
            )

        # 3. Validar que bloque existe y está activo
        bloque = self.bloque_repository.get_by_id(bloque_id)
        if not bloque:
            raise NotFoundException(
                message=f"Bloque horario con ID {bloque_id} no encontrado",
                details={"bloque_id": bloque_id},
            )

        if not bloque.activo:
            raise BusinessLogicException(
                message=f"El bloque {bloque_id} no está activo",
                details={"bloque_id": bloque_id, "activo": bloque.activo},
            )

        # 4. Validar disponibilidad de ambas empresas en el bloque
        if not self.reunion_repository.check_empresa_disponible_en_bloque(
            bloque_id, empresa_a_id
        ):
            raise BusinessLogicException(
                message=f"La empresa {empresa_a.nombre} ya tiene una reunión en este bloque",
                details={"empresa_id": str(empresa_a_id), "bloque_id": bloque_id},
            )

        if not self.reunion_repository.check_empresa_disponible_en_bloque(
            bloque_id, empresa_b_id
        ):
            raise BusinessLogicException(
                message=f"La empresa {empresa_b.nombre} ya tiene una reunión en este bloque",
                details={"empresa_id": str(empresa_b_id), "bloque_id": bloque_id},
            )

        # 5. Si el bloque tiene evento_id, validar que ambas empresas estén inscritas
        if bloque.evento_id is not None:
            inscripcion_a = self.empresa_evento_repository.get_by_empresa_evento(
                empresa_a_id, bloque.evento_id
            )
            if not inscripcion_a:
                raise BusinessLogicException(
                    message=f"La empresa {empresa_a.nombre} no está inscrita en el evento",
                    details={
                        "empresa_id": str(empresa_a_id),
                        "evento_id": str(bloque.evento_id),
                    },
                )

            inscripcion_b = self.empresa_evento_repository.get_by_empresa_evento(
                empresa_b_id, bloque.evento_id
            )
            if not inscripcion_b:
                raise BusinessLogicException(
                    message=f"La empresa {empresa_b.nombre} no está inscrita en el evento",
                    details={
                        "empresa_id": str(empresa_b_id),
                        "evento_id": str(bloque.evento_id),
                    },
                )

        # 6. Marcar bloque como no disponible ANTES de crear la reunión
        self.bloque_repository.update(
            bloque_id=bloque_id,
            disponible=False
        )

        # 7. Crear reunión
        reunion = self.reunion_repository.create(
            bloque_id=bloque_id,
            empresa_a_id=empresa_a_id,
            empresa_b_id=empresa_b_id,
            estado=estado,
            notas=notas,
            requiere_interprete=requiere_interprete,
            sala=sala,
            resultado=resultado,
        )

        return reunion
