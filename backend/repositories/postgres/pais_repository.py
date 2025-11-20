"""Repository for Pais (Country) operations."""

from typing import List, Optional

from models.sqlalchemy.pais_model import PaisModel
from sqlalchemy.orm import Session


class PaisRepository:
    """Repository for managing Pais (Country) data."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, only_active: bool = True) -> List[PaisModel]:
        """Get all countries."""
        query = self.db.query(PaisModel)
        if only_active:
            query = query.filter(PaisModel.activo == True)
        return query.order_by(PaisModel.nombre).all()

    def get_by_id(self, pais_id: int) -> Optional[PaisModel]:
        """Get a country by ID."""
        return self.db.query(PaisModel).filter(PaisModel.id == pais_id).first()

    def get_by_codigo(self, codigo: str) -> Optional[PaisModel]:
        """Get a country by ISO code."""
        return self.db.query(PaisModel).filter(PaisModel.codigo == codigo).first()
