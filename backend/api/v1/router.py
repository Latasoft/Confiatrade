from api.v1.endpoints import (
    auth,
    bloques_horarios,
    catalogos,
    credenciales,
    curaduria,
    empresas,
    empresas_eventos,
    eventos,
    kpis,
    participantes,
    reuniones,
    seguimiento,
)
from fastapi import APIRouter

api_router = APIRouter()

# Autenticación (sin prefijo /api/v1 para que sea /api/v1/auth)
api_router.include_router(auth.router, prefix="/auth", tags=["autenticación"])

# Catálogos (públicos, sin autenticación)
api_router.include_router(catalogos.router)

# KPIs (métricas del sistema)
api_router.include_router(kpis.router, prefix="/kpis", tags=["kpis"])

# Credenciales
api_router.include_router(
    credenciales.router, prefix="/credenciales", tags=["credenciales"]
)

api_router.include_router(empresas.router, prefix="/empresas", tags=["empresas"])
api_router.include_router(eventos.router, prefix="/eventos", tags=["eventos"])
api_router.include_router(
    empresas_eventos.router, prefix="/empresas-eventos", tags=["empresas-eventos"]
)
api_router.include_router(
    participantes.router, prefix="/participantes", tags=["participantes"]
)
api_router.include_router(
    bloques_horarios.router, prefix="/bloques-horarios", tags=["bloques-horarios"]
)
api_router.include_router(reuniones.router, prefix="/reuniones", tags=["reuniones"])
api_router.include_router(
    seguimiento.router, prefix="/seguimiento", tags=["seguimiento"]
)
api_router.include_router(curaduria.router, tags=["curaduria"])
