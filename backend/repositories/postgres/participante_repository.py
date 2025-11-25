"""Repository para Participantes"""

from typing import Optional
from uuid import UUID

from models.sqlalchemy import ParticipanteModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload


class ParticipanteRepository:
    """Repository para gestión de participantes"""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        empresa_id: UUID,
        nombre_completo: str,
        email: str,
        cargo: Optional[str] = None,
        telefono: Optional[str] = None,
        idioma: str = "ES",
        requiere_interprete: bool = False,
        foto_url: Optional[str] = None,
        qr_data: Optional[str] = None,
    ) -> ParticipanteModel:
        """Crear un nuevo participante"""
        participante = ParticipanteModel(
            empresa_id=empresa_id,
            nombre_completo=nombre_completo,
            email=email,
            cargo=cargo,
            telefono=telefono,
            idioma=idioma,
            requiere_interprete=requiere_interprete,
            foto_url=foto_url,
            qr_data=qr_data,
        )
        self.db.add(participante)
        self.db.commit()
        self.db.refresh(participante)

        # Recargar con relaciones para evitar errores de serialización
        return self.get_by_id(participante.id)

    def get_by_id(self, participante_id: UUID) -> Optional[ParticipanteModel]:
        """Obtener participante por ID con empresa cargada"""
        return (
            self.db.query(ParticipanteModel)
            .options(joinedload(ParticipanteModel.empresa))
            .filter(ParticipanteModel.id == participante_id)
            .first()
        )

    def get_by_email_and_empresa(
        self, email: str, empresa_id: UUID
    ) -> Optional[ParticipanteModel]:
        """Buscar participante por email y empresa (para validar duplicados)"""
        return (
            self.db.query(ParticipanteModel)
            .filter(
                ParticipanteModel.email == email,
                ParticipanteModel.empresa_id == empresa_id,
            )
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        empresa_id: Optional[UUID] = None,
    ) -> list[ParticipanteModel]:
        """Obtener todos los participantes con filtros opcionales"""
        query = self.db.query(ParticipanteModel).options(
            joinedload(ParticipanteModel.empresa)
        )

        if empresa_id is not None:
            query = query.filter(ParticipanteModel.empresa_id == empresa_id)

        return query.offset(skip).limit(limit).all()

    def get_by_empresa(self, empresa_id: UUID) -> list[ParticipanteModel]:
        """Obtener todos los participantes de una empresa"""
        return (
            self.db.query(ParticipanteModel)
            .options(joinedload(ParticipanteModel.empresa))
            .filter(ParticipanteModel.empresa_id == empresa_id)
            .all()
        )

    def update(
        self,
        participante_id: UUID,
        nombre_completo: Optional[str] = None,
        cargo: Optional[str] = None,
        email: Optional[str] = None,
        telefono: Optional[str] = None,
        idioma: Optional[str] = None,
        requiere_interprete: Optional[bool] = None,
        foto_url: Optional[str] = None,
        check_in_realizado: Optional[bool] = None,
        fecha_check_in=None,
    ) -> Optional[ParticipanteModel]:
        """Actualizar participante"""
        participante = self.get_by_id(participante_id)
        if not participante:
            return None

        if nombre_completo is not None:
            participante.nombre_completo = nombre_completo
        if cargo is not None:
            participante.cargo = cargo
        if email is not None:
            participante.email = email
        if telefono is not None:
            participante.telefono = telefono
        if idioma is not None:
            participante.idioma = idioma
        if requiere_interprete is not None:
            participante.requiere_interprete = requiere_interprete
        if foto_url is not None:
            participante.foto_url = foto_url
        if check_in_realizado is not None:
            participante.check_in_realizado = check_in_realizado
        if fecha_check_in is not None:
            participante.fecha_check_in = fecha_check_in

        self.db.commit()
        self.db.refresh(participante)

        # Asegurar que la relación empresa esté cargada
        if participante.empresa is None:
            # Solo recargar si no está cargada
            participante = self.get_by_id(participante_id)

        return participante

    def delete(self, participante_id: UUID) -> bool:
        """Eliminar participante (hard delete)"""
        participante = self.get_by_id(participante_id)
        if not participante:
            return False

        self.db.delete(participante)
        self.db.commit()
        return True

    def count_total(self, empresa_id: Optional[UUID] = None) -> int:
        """Contar total de participantes"""
        query = self.db.query(func.count(ParticipanteModel.id))

        if empresa_id is not None:
            query = query.filter(ParticipanteModel.empresa_id == empresa_id)

        return query.scalar() or 0

    def get_by_qr(self, qr_data: str) -> Optional[ParticipanteModel]:
        """Buscar participante por QR data"""
        return (
            self.db.query(ParticipanteModel)
            .options(joinedload(ParticipanteModel.empresa))
            .filter(ParticipanteModel.qr_data == qr_data)
            .first()
        )
