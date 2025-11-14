# ConfíaTrade Backend

Backend API construido con Clean Architecture (Hexagonal).

## Arquitectura

```
api/          Capa de presentación (controllers, schemas)
core/         Capa de dominio (entities, use cases, interfaces)
repositories/ Capa de infraestructura (implementaciones)
services/     Servicios externos
models/       Modelos ORM (SQLAlchemy)
```

## Setup

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
```

Configurar variables en `.env`

## Iniciar base de datos

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

## Ejecutar

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API disponible en: http://localhost:8000
Documentación: http://localhost:8000/docs

## Principios

- Clean Architecture
- SOLID principles
- Dependency Injection
- Repository Pattern
- Separación de capas
