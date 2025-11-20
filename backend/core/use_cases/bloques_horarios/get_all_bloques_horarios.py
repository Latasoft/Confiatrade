"""Use case: Obtener Bloques Horarios"""

from datetime import date
from typing import Optional
from uuid import UUID

from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository


class GetAllBloquesHorariosUseCase:
    """Use case para obtener lista de bloques horarios"""

    def __init__(self, bloque_repository: BloqueHorarioRepository):
        self.bloque_repository = bloque_repository

    def execute(
        self,
        skip: int = 0,
        limit: int = 100,
        evento_id: Optional[UUID] = None,
        fecha: Optional[date] = None,
        activo: Optional[bool] = None,
    ):
        """
        Obtener bloques con filtros opcionales:
        - evento_id: Filtrar por evento
        - fecha: Filtrar por fecha específica
        - activo: Filtrar por estado
        - skip/limit: Paginación
        """
        bloques = self.bloque_repository.get_all(
            skip=skip, limit=limit, evento_id=evento_id, fecha=fecha, activo=activo
        )

        # Agregar nombre de evento a cada bloque
        bloques_con_evento = []
        for b in bloques:
            bloque_dict = {
                "id": b.id,
                "evento_id": b.evento_id,
                "fecha": b.fecha,
                "hora_inicio": b.hora_inicio,
                "hora_fin": b.hora_fin,
                "duracion_minutos": b.duracion_minutos,
                "ubicacion": b.ubicacion,
                "label": b.label,
                "activo": b.activo,
                "created_at": b.created_at,
                "evento_nombre": b.evento.nombre if b.evento else None,
            }
            bloques_con_evento.append(bloque_dict)

        total = self.bloque_repository.count_total(
            evento_id=evento_id, fecha=fecha, activo=activo
        )

        return {"bloques": bloques_con_evento, "total": total}
