"""Use case: Obtener Participantes"""

from uuid import UUID

from repositories.postgres.participante_repository import ParticipanteRepository


class GetAllParticipantesUseCase:
    """Use case para obtener lista de participantes"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        empresa_id: UUID | None = None,
    ):
        """
        Obtener participantes con filtros opcionales:
        - empresa_id: Filtrar por empresa
        - skip/limit: Paginación
        """
        participantes = self.participante_repository.get_all(
            skip=skip, limit=limit, empresa_id=empresa_id
        )

        # Agregar nombre de empresa a cada participante
        participantes_con_empresa = []
        for p in participantes:
            participante_dict = {
                "id": p.id,
                "empresa_id": p.empresa_id,
                "nombre_completo": p.nombre_completo,
                "cargo": p.cargo,
                "email": p.email,
                "telefono": p.telefono,
                "idioma": p.idioma,
                "requiere_interprete": p.requiere_interprete,
                "foto_url": p.foto_url,
                "qr_data": p.qr_data,
                "check_in_realizado": p.check_in_realizado,
                "fecha_check_in": p.fecha_check_in,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "empresa_nombre": p.empresa.nombre if p.empresa else None,
            }
            participantes_con_empresa.append(participante_dict)

        total = self.participante_repository.count_total(empresa_id=empresa_id)

        return {"participantes": participantes_con_empresa, "total": total}
