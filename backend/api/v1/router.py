from api.v1.endpoints import empresas
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(empresas.router, prefix="/empresas", tags=["empresas"])
