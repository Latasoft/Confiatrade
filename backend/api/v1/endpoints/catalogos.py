"""Endpoints for catalogs (paises, sectores, etc.)."""

from typing import List

from api.schemas.catalogos import PaisResponse, SectorResponse
from database import get_db
from fastapi import APIRouter, Depends
from repositories.postgres.pais_repository import PaisRepository
from repositories.postgres.sector_repository import SectorRepository
from sqlalchemy.orm import Session

router = APIRouter(prefix="/catalogos", tags=["catalogos"])


@router.get("/paises", response_model=List[PaisResponse])
def get_paises(db: Session = Depends(get_db)):
    """Get all countries."""
    repo = PaisRepository(db)
    paises = repo.get_all()
    return [PaisResponse.from_orm(pais) for pais in paises]


@router.get("/sectores", response_model=List[SectorResponse])
def get_sectores(db: Session = Depends(get_db)):
    """Get all business sectors."""
    repo = SectorRepository(db)
    sectores = repo.get_all()
    return sectores
