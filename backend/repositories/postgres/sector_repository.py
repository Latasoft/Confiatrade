"""Repository for Sector (Business Sector) operations."""

from typing import List, Optional

from models.sqlalchemy.sector_model import SectorModel
from sqlalchemy.orm import Session


class SectorRepository:
    """Repository for managing Sector (Business Sector) data."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, only_active: bool = True) -> List[SectorModel]:
        """Get all business sectors."""
        query = self.db.query(SectorModel)
        if only_active:
            query = query.filter(SectorModel.activo == True)
        return query.order_by(SectorModel.nombre).all()

    def get_by_id(self, sector_id: int) -> Optional[SectorModel]:
        """Get a sector by ID."""
        return self.db.query(SectorModel).filter(SectorModel.id == sector_id).first()
