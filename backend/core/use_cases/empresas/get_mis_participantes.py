"""Use case: Obtener participantes de mi empresa"""

from uuid import UUID

from repositories.postgres.participante_repository import ParticipanteRepository


class GetMisParticipantesUseCase:
    """Use case para obtener los participantes de una empresa específica"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(self, empresa_id: UUID, skip: int = 0, limit: int = 100):
        """
        Obtener todos los participantes de una empresa

        Args:
            empresa_id: ID de la empresa
            skip: Offset para paginación
            limit: Límite de resultados

        Returns:
            Lista de participantes de la empresa
        """
        return self.participante_repository.get_all(
            skip=skip, limit=limit, empresa_id=empresa_id
        )
