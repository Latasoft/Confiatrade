"""Use case: Crear Curaduría"""

from typing import Optional
from uuid import UUID

from core.exceptions import BusinessLogicException, NotFoundException
from repositories.postgres.curaduria_repository import CuraduriaRepository
from repositories.postgres.empresa_repository import PostgresEmpresaRepository


class CrearCuraduriaUseCase:
    """Use case para crear curaduría con validaciones"""

    def __init__(
        self,
        curaduria_repository: CuraduriaRepository,
        empresa_repository: PostgresEmpresaRepository,
    ):
        self.curaduria_repository = curaduria_repository
        self.empresa_repository = empresa_repository

    def execute(
        self,
        empresa_id: UUID,
        ofrece: Optional[str] = None,
        busca: Optional[str] = None,
        objetivos: Optional[str] = None,
        capacidades: Optional[str] = None,
        notas_internas: Optional[str] = None,
    ):
        """
        Crear curaduría con validaciones:
        - Empresa debe existir
        - Una empresa solo puede tener una curaduría (1:1)
        """
        # 1. Validar que empresa existe
        empresa = self.empresa_repository.get_by_id(empresa_id)
        if not empresa:
            raise NotFoundException(
                message=f"Empresa con ID {empresa_id} no encontrada",
                details={"empresa_id": str(empresa_id)},
            )

        # 2. Validar que no existe curaduría previa para esta empresa
        curaduria_existente = self.curaduria_repository.get_by_empresa_id(empresa_id)
        if curaduria_existente:
            raise BusinessLogicException(
                message=f"La empresa {empresa.nombre} ya tiene una curaduría",
                details={
                    "empresa_id": str(empresa_id),
                    "curaduria_id": str(curaduria_existente.id),
                },
            )

        # 3. Crear curaduría
        curaduria = self.curaduria_repository.create(
            empresa_id=empresa_id,
            ofrece=ofrece,
            busca=busca,
            objetivos=objetivos,
            capacidades=capacidades,
            notas_internas=notas_internas,
        )

        return curaduria
