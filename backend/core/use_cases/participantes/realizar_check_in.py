"""Use case para realizar check-in de participante"""

import json
from datetime import datetime
from uuid import UUID

from core.exceptions import BusinessLogicException, NotFoundException, ValidationException
from repositories.postgres.participante_repository import ParticipanteRepository


class RealizarCheckInUseCase:
    """Use case para realizar check-in de un participante usando QR"""

    def __init__(self, participante_repository: ParticipanteRepository):
        self.participante_repository = participante_repository

    def execute(
        self,
        participante_id: UUID,
        qr_data_json: str | None = None,
        force: bool = False,
    ):
        """
        Realiza el check-in de un participante

        Args:
            participante_id: ID del participante
            qr_data_json: JSON del QR escaneado (opcional, si se proporciona se valida)
            force: Si es True, permite check-in sin validación QR

        Returns:
            Participante actualizado con check-in realizado

        Raises:
            NotFoundException: Si el participante no existe
            ValidationException: Si el QR es inválido
            BusinessLogicException: Si ya tiene check-in realizado
        """
        print(f"[USE CASE] Ejecutando check-in")
        print(f"  → Buscando participante ID: {participante_id}")
        
        # 1. Obtener participante
        participante = self.participante_repository.get_by_id(participante_id)
        if not participante:
            print(f"  ✗ Participante NO encontrado")
            raise NotFoundException(
                message=f"Participante con ID {participante_id} no encontrado"
            )
        
        print(f"  ✓ Participante encontrado: {participante.nombre_completo}")
        print(f"  → Check-in previo: {participante.check_in_realizado}")
        print(f"  → Fecha check-in: {participante.fecha_check_in}")

        # 2. Validar que no tenga check-in previo
        if participante.check_in_realizado and not force:
            print(f"  ✗ Ya tiene check-in y force=False → RECHAZADO")
            raise BusinessLogicException(
                message=f"El participante '{participante.nombre_completo}' ya tiene check-in realizado"
            )
        
        if participante.check_in_realizado and force:
            print(f"  ⚠ Ya tiene check-in pero force=True → PERMITIENDO")

        # 3. Validar QR si se proporciona
        if qr_data_json and not force:
            print(f"  → Validando QR: {qr_data_json[:50]}...")
            try:
                qr_data = json.loads(qr_data_json)
                print(f"  → QR parseado correctamente: {qr_data}")
            except json.JSONDecodeError as e:
                print(f"  ✗ Error al parsear QR: {e}")
                raise ValidationException(
                    message="El código QR es inválido o está corrupto"
                )

            # Validar que el QR corresponde a este participante
            qr_tipo = qr_data.get("tipo")
            qr_id = qr_data.get("id")
            print(f"  → QR tipo: {qr_tipo}, QR ID: {qr_id}")
            
            if qr_tipo != "participante":
                print(f"  ✗ QR tipo incorrecto: esperado 'participante', recibido '{qr_tipo}'")
                raise ValidationException(
                    message="El código QR no es de tipo participante"
                )

            if qr_id != str(participante_id):
                print(f"  ✗ QR ID no coincide: esperado '{participante_id}', recibido '{qr_id}'")
                raise ValidationException(
                    message="El código QR no corresponde a este participante"
                )
            
            print(f"  ✓ QR válido y coincide con el participante")
        elif qr_data_json and force:
            print(f"  ⚠ QR ignorado por force=True")
        else:
            print(f"  → Sin QR, realizando check-in directo")

        # 4. Actualizar participante directamente (ya lo tenemos cargado con empresa)
        print(f"  → Actualizando check-in en base de datos...")
        participante.check_in_realizado = True
        participante.fecha_check_in = datetime.utcnow()
        
        try:
            self.participante_repository.db.commit()
            self.participante_repository.db.refresh(participante)
            print(f"  ✓ Check-in actualizado correctamente")
            print(f"  → Nueva fecha check-in: {participante.fecha_check_in}")
        except Exception as e:
            print(f"  ✗ Error al actualizar base de datos: {e}")
            raise

        print(f"[USE CASE] ✓ Check-in completado exitosamente\n")
        return participante
