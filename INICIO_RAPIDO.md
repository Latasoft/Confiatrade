# ConfíaTrade - Guía de Inicio Rápido

## Arquitectura Implementada

**Backend**: Clean Architecture (Hexagonal) con FastAPI
**Frontend**: Feature-based con React + Vite + Tailwind

## Estrategia de Migración

Desarrollo en paralelo - El sistema actual en `app/` sigue funcionando mientras desarrollamos el nuevo en `backend/` y `frontend/`.

## Iniciar Backend

```powershell
cd backend

python -m venv venv
.\venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
```

Editar `.env` con tus credenciales de base de datos.

Inicializar base de datos:

```powershell
alembic revision --autogenerate -m "initial migration"
alembic upgrade head
```

Ejecutar:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API disponible en: http://localhost:8000
Documentación: http://localhost:8000/docs

## Iniciar Frontend

```powershell
cd frontend

npm install

echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

npm run dev
```

Frontend disponible en: http://localhost:3000

## Estructura del Proyecto

```
Confiatrade/
├── app/                    Sistema actual (Next.js)
├── backend/                Nuevo backend (FastAPI)
│   ├── api/               Capa de presentación
│   ├── core/              Capa de dominio
│   ├── repositories/      Capa de infraestructura
│   ├── services/          Servicios externos
│   └── models/            Modelos ORM
│
└── frontend/               Nuevo frontend (React + Vite)
    └── src/
        ├── features/      Módulos por funcionalidad
        ├── shared/        Código compartido
        └── layout/        Layouts principales
```

## Próximos Pasos

1. Configurar PostgreSQL en Supabase
2. Completar migraciones de base de datos
3. Implementar autenticación JWT
4. Desarrollar features restantes (participantes, curaduría, agenda, etc.)
5. Agregar tests
6. Deploy

## Eliminar Sistema Anterior

Una vez el nuevo sistema esté completo y probado:

```powershell
Remove-Item -Recurse -Force app, components, lib, middleware.ts, next.config.ts, package.json
```

Por ahora, mantener ambos sistemas permite desarrollo sin interrupciones.
