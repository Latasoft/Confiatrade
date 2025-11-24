"""Repository para Usuario"""

from typing import Optional
from uuid import UUID

from core.security import get_password_hash
from models.sqlalchemy.empresa import EmpresaModel
from models.sqlalchemy.usuario_model import UsuarioModel
from sqlalchemy.orm import Session, joinedload


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        email: str,
        password: str,
        nombre_completo: Optional[str],
        rol: str = "empresa",
        empresa_id: Optional[UUID] = None,
    ) -> UsuarioModel:
        """Crea un nuevo usuario"""
        hashed_password = get_password_hash(password)
        usuario = UsuarioModel(
            email=email,
            hashed_password=hashed_password,
            nombre_completo=nombre_completo,
            rol=rol,
            empresa_id=empresa_id,
        )
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def get_by_id(self, usuario_id: UUID) -> Optional[UsuarioModel]:
        """Obtiene un usuario por ID con su empresa"""
        return (
            self.db.query(UsuarioModel)
            .options(
                joinedload(UsuarioModel.empresa).joinedload(EmpresaModel.pais),
                joinedload(UsuarioModel.empresa).joinedload(EmpresaModel.sector),
            )
            .filter(UsuarioModel.id == usuario_id)
            .first()
        )

    def get_by_email(self, email: str) -> Optional[UsuarioModel]:
        """Obtiene un usuario por email con su empresa"""
        return (
            self.db.query(UsuarioModel)
            .options(
                joinedload(UsuarioModel.empresa).joinedload(EmpresaModel.pais),
                joinedload(UsuarioModel.empresa).joinedload(EmpresaModel.sector),
            )
            .filter(UsuarioModel.email == email)
            .first()
        )

    def get_all(self, skip: int = 0, limit: int = 100) -> list[UsuarioModel]:
        """Obtiene todos los usuarios"""
        return (
            self.db.query(UsuarioModel)
            .options(joinedload(UsuarioModel.empresa))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_password(
        self, usuario_id: UUID, new_password: str
    ) -> Optional[UsuarioModel]:
        """Actualiza la contraseña de un usuario"""
        usuario = self.get_by_id(usuario_id)
        if usuario:
            usuario.hashed_password = get_password_hash(new_password)
            self.db.commit()
            self.db.refresh(usuario)
        return usuario

    def delete(self, usuario_id: UUID) -> bool:
        """Elimina un usuario"""
        usuario = self.get_by_id(usuario_id)
        if usuario:
            self.db.delete(usuario)
            self.db.commit()
            return True
        return False
