"""Use case: Generar Bloques Horarios Automáticamente"""

from datetime import date, datetime, time, timedelta
from typing import Optional
from uuid import UUID

from core.exceptions import NotFoundException, ValidationException
from models.sqlalchemy import BloqueHorarioModel
from repositories.postgres.bloque_horario_repository import BloqueHorarioRepository
from repositories.postgres.evento_repository import EventoRepository


class GenerarBloquesHorariosUseCase:
    """Use case para generar bloques horarios automáticamente"""

    def __init__(
        self,
        bloque_repository: BloqueHorarioRepository,
        evento_repository: EventoRepository,
    ):
        self.bloque_repository = bloque_repository
        self.evento_repository = evento_repository

    def execute(
        self,
        fecha_inicio: date,
        fecha_fin: date,
        hora_inicio: time,
        hora_fin: time,
        duracion_minutos: int,
        evento_id: Optional[UUID] = None,
        ubicacion: Optional[str] = None,
        label_prefijo: Optional[str] = None,
    ):
        """
        Generar bloques automáticos:
        - Para cada día entre fecha_inicio y fecha_fin
        - Dividir jornada (hora_inicio - hora_fin) en bloques de duracion_minutos
        - Crear bloques en batch
        """
        # 1. Si hay evento_id, validar que existe
        if evento_id is not None:
            evento = self.evento_repository.get_by_id(evento_id)
            if not evento:
                raise NotFoundException(
                    message=f"Evento con ID {evento_id} no encontrado",
                    details={"evento_id": str(evento_id)},
                )

        # 2. Validaciones
        if fecha_fin < fecha_inicio:
            raise ValidationException(
                message="fecha_fin debe ser igual o posterior a fecha_inicio",
                details={
                    "fecha_inicio": str(fecha_inicio),
                    "fecha_fin": str(fecha_fin),
                },
            )

        if hora_fin <= hora_inicio:
            raise ValidationException(
                message="hora_fin debe ser posterior a hora_inicio",
                details={"hora_inicio": str(hora_inicio), "hora_fin": str(hora_fin)},
            )

        if duracion_minutos < 15 or duracion_minutos > 240:
            raise ValidationException(
                message="duracion_minutos debe estar entre 15 y 240",
                details={"duracion_minutos": duracion_minutos},
            )

        # 3. Generar bloques
        bloques_a_crear = []
        fecha_actual = fecha_inicio
        contador = 1

        while fecha_actual <= fecha_fin:
            # Generar bloques para este día
            hora_actual = datetime.combine(fecha_actual, hora_inicio)
            hora_limite = datetime.combine(fecha_actual, hora_fin)

            while hora_actual < hora_limite:
                siguiente_hora = hora_actual + timedelta(minutes=duracion_minutos)

                # Si el bloque excede la hora límite, ajustar
                if siguiente_hora > hora_limite:
                    break

                # Crear label
                label = (
                    f"{label_prefijo}-{contador}" if label_prefijo else f"B{contador}"
                )

                bloque = BloqueHorarioModel(
                    evento_id=evento_id,
                    fecha=fecha_actual,
                    hora_inicio=hora_actual.time(),
                    hora_fin=siguiente_hora.time(),
                    duracion_minutos=duracion_minutos,
                    ubicacion=ubicacion,
                    label=label,
                    activo=True,
                )
                bloques_a_crear.append(bloque)

                hora_actual = siguiente_hora
                contador += 1

            # Siguiente día
            fecha_actual += timedelta(days=1)

        # 4. Crear bloques en batch
        if not bloques_a_crear:
            raise ValidationException(
                message="No se generaron bloques con los parámetros proporcionados",
                details={
                    "fecha_inicio": str(fecha_inicio),
                    "fecha_fin": str(fecha_fin),
                    "hora_inicio": str(hora_inicio),
                    "hora_fin": str(hora_fin),
                    "duracion_minutos": duracion_minutos,
                },
            )

        bloques_creados = self.bloque_repository.bulk_create(bloques_a_crear)

        return {
            "bloques_creados": len(bloques_creados),
            "bloques": bloques_creados,
        }
