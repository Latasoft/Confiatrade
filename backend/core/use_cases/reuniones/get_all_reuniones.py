"""Use case: Obtener Reuniones"""

from typing import Optional
from uuid import UUID

from repositories.postgres.reunion_repository import ReunionRepository


class GetAllReunionesUseCase:
    """Use case para obtener lista de reuniones"""

    def __init__(self, reunion_repository: ReunionRepository):
        self.reunion_repository = reunion_repository

    def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        empresa_id: Optional[UUID] = None,
        bloque_id: Optional[int] = None,
        estado: Optional[str] = None,
        sala: Optional[str] = None,
        evento_id: Optional[UUID] = None,
    ):
        """
        Obtener reuniones con filtros opcionales:
        - empresa_id: Filtrar por empresa (A o B)
        - bloque_id: Filtrar por bloque
        - estado: Filtrar por estado
        - sala: Filtrar por sala
        - evento_id: Filtrar por evento
        - skip/limit: Paginación
        """
        reuniones = self.reunion_repository.get_all(
            skip=skip,
            limit=limit,
            empresa_id=empresa_id,
            bloque_id=bloque_id,
            estado=estado,
            sala=sala,
            evento_id=evento_id,
        )

        # Agregar datos relacionados a cada reunión
        reuniones_detalle = []
        for r in reuniones:
            reunion_dict = {
                "id": r.id,
                "bloque_id": r.bloque_id,
                "empresa_a_id": r.empresa_a_id,
                "empresa_b_id": r.empresa_b_id,
                "estado": r.estado,
                "notas": r.notas,
                "requiere_interprete": r.requiere_interprete,
                "sala": r.sala,
                "resultado": r.resultado,
                "created_at": r.created_at,
                "updated_at": r.updated_at,
                "empresa_a_nombre": r.empresa_a.nombre if r.empresa_a else None,
                "empresa_b_nombre": r.empresa_b.nombre if r.empresa_b else None,
                "bloque_fecha": str(r.bloque.fecha) if r.bloque else None,
                "bloque_hora_inicio": str(r.bloque.hora_inicio) if r.bloque else None,
                "bloque_hora_fin": str(r.bloque.hora_fin) if r.bloque else None,
                "bloque_ubicacion": r.bloque.ubicacion if r.bloque else None,
                "evento_id": r.bloque.evento_id if r.bloque else None,
                "evento_nombre": (
                    r.bloque.evento.nombre if r.bloque and r.bloque.evento else None
                ),
            }
            reuniones_detalle.append(reunion_dict)

        total = self.reunion_repository.count_total(
            empresa_id=empresa_id, estado=estado, evento_id=evento_id
        )

        return {"reuniones": reuniones_detalle, "total": total}
