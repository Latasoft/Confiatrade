# Plan de Migración: ConfíaTrade

## De Next.js Monolítico a Clean Architecture

## OBJETIVO

Migrar ConfíaTrade a una arquitectura limpia y escalable:

- **Backend**: FastAPI con Clean Architecture (Hexagonal)
- **Frontend**: React + Vite + Tailwind CSS
- **Base de Datos**: PostgreSQL (Supabase)
- **Principios**: Código limpio, arquitectura clara, sin decoraciones innecesarias

## FASE 1: ANÁLISIS Y PREPARACIÓN

### 1.1 Arquitectura Backend: Clean Architecture (Hexagonal)

La arquitectura mostrada en la imagen es **Clean Architecture** o **Arquitectura Hexagonal (Ports & Adapters)**.

#### Capas del Backend:

```
backend/
├── api/                          CAPA DE PRESENTACIÓN
│   ├── v1/
│   │   ├── endpoints/            Controladores REST
│   │   ├── dependencies.py       Inyección de dependencias
│   │   └── router.py             Router principal
│   └── schemas/                  DTOs (Data Transfer Objects)
│
├── core/                         CAPA DE DOMINIO (NÚCLEO)
│   ├── entities/                 Entidades de negocio
│   ├── use_cases/                Casos de uso (lógica de negocio)
│   └── interfaces/               Interfaces (ports)
│       ├── repositories/         Contratos de repositorios
│       └── services/             Contratos de servicios
│
├── repositories/                 CAPA DE INFRAESTRUCTURA
│   ├── postgres/                 Implementaciones PostgreSQL
│   └── cache/                    Implementaciones Redis
│
├── services/                     SERVICIOS EXTERNOS
│   ├── email/
│   ├── storage/
│   └── qr/
│
├── models/                       MODELOS ORM
│   └── sqlalchemy/
│
├── utils/                        UTILIDADES
├── exceptions/                   EXCEPCIONES PERSONALIZADAS
├── middleware/                   MIDDLEWARE
├── logs/                         CONFIGURACIÓN DE LOGS
└── main.py                       Entry point
```

#### Flujo de dependencias (Regla de dependencia):

```
API → Use Cases → Entities
         ↓
    Repositories (Interface)
         ↓
    Repositories (Implementation)
```

### 1.2 Arquitectura Frontend: Feature-Based con React

```
frontend/
├── src/
│   ├── main.tsx                  Entry point
│   ├── App.tsx
│   ├── router.tsx
│   │
│   ├── features/                 ORGANIZACIÓN POR FEATURES
│   │   ├── empresas/
│   │   │   ├── api/              Llamadas API específicas
│   │   │   ├── components/       Componentes de la feature
│   │   │   ├── hooks/            Hooks específicos
│   │   │   ├── pages/            Páginas
│   │   │   ├── store/            Estado local (Zustand)
│   │   │   ├── types/            Types TypeScript
│   │   │   └── utils/            Utilidades específicas
│   │   │
│   │   ├── participantes/
│   │   ├── curaduria/
│   │   ├── agenda/
│   │   ├── credenciales/
│   │   ├── kpis/
│   │   └── seguimiento/
│   │
│   ├── shared/                   COMPARTIDO ENTRE FEATURES
│   │   ├── api/                  Cliente HTTP base
│   │   ├── components/           Componentes reutilizables
│   │   ├── hooks/                Hooks globales
│   │   ├── store/                Estado global
│   │   ├── types/                Types compartidos
│   │   ├── utils/                Utilidades globales
│   │   └── constants/            Constantes
│   │
│   ├── layout/                   LAYOUTS
│   │   ├── MainLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   │
│   └── styles/
│       └── index.css
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 1.3 Principios de Desarrollo

**Backend:**

- Clean Architecture con separación clara de capas
- SOLID principles
- Dependency Injection
- Repository Pattern
- Use Cases explícitos
- Sin lógica de negocio en controllers

**Frontend:**

- Feature-based organization
- Separation of concerns
- Custom hooks para lógica
- Componentes puros y presentacionales
- Estado centralizado (Zustand + React Query)

**Código:**

- Sin emojis
- Sin iconos decorativos en código
- Comentarios solo cuando sea necesario para aclarar ambigüedades
- Nombres descriptivos sobre comentarios
- TypeScript estricto

## FASE 2: CONFIGURACIÓN DEL ENTORNO

### 2.1 Backend - Clean Architecture FastAPI

**Estructura completa:**

```
backend/
├── api/
│   ├── v1/
│   │   ├── endpoints/
│   │   │   ├── empresas.py
│   │   │   ├── participantes.py
│   │   │   ├── curaduria.py
│   │   │   ├── agenda.py
│   │   │   ├── credenciales.py
│   │   │   ├── kpis.py
│   │   │   └── seguimiento.py
│   │   ├── dependencies.py
│   │   └── router.py
│   └── schemas/
│       ├── empresa.py
│       ├── participante.py
│       └── ...
│
├── core/
│   ├── entities/
│   │   ├── empresa.py
│   │   ├── participante.py
│   │   ├── reunion.py
│   │   └── ...
│   ├── use_cases/
│   │   ├── empresas/
│   │   │   ├── create_empresa.py
│   │   │   ├── get_empresas.py
│   │   │   └── update_empresa.py
│   │   ├── curaduria/
│   │   │   └── calculate_matches.py
│   │   └── ...
│   └── interfaces/
│       ├── repositories/
│       │   ├── empresa_repository.py
│       │   └── ...
│       └── services/
│           ├── qr_service.py
│           └── export_service.py
│
├── repositories/
│   └── postgres/
│       ├── empresa_repository.py
│       ├── participante_repository.py
│       └── ...
│
├── services/
│   ├── qr/
│   │   └── qr_generator.py
│   ├── export/
│   │   ├── csv_export.py
│   │   └── pdf_export.py
│   └── email/
│       └── email_sender.py
│
├── models/
│   └── sqlalchemy/
│       ├── base.py
│       ├── empresa.py
│       ├── participante.py
│       └── ...
│
├── exceptions/
│   ├── base.py
│   └── custom_exceptions.py
│
├── middleware/
│   ├── error_handler.py
│   └── logging.py
│
├── utils/
│   ├── security.py
│   └── datetime.py
│
├── logs/
├── config.py
├── database.py
└── main.py
```

**Instalación:**

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate

pip install fastapi[all] uvicorn
pip install sqlalchemy psycopg2-binary alembic
pip install pydantic pydantic-settings
pip install python-jose[cryptography] passlib[bcrypt]
pip install python-multipart qrcode pillow
pip install pandas reportlab
```

### 2.2 Frontend - React + Vite

**Estructura completa:**

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   │
│   ├── features/
│   │   ├── empresas/
│   │   │   ├── api/
│   │   │   │   └── empresasApi.ts
│   │   │   ├── components/
│   │   │   │   ├── EmpresaCard.tsx
│   │   │   │   ├── EmpresaForm.tsx
│   │   │   │   └── EmpresaTable.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useEmpresas.ts
│   │   │   ├── pages/
│   │   │   │   ├── EmpresasPage.tsx
│   │   │   │   └── EmpresaDetailPage.tsx
│   │   │   ├── store/
│   │   │   │   └── empresasStore.ts
│   │   │   └── types/
│   │   │       └── empresa.types.ts
│   │   │
│   │   ├── participantes/
│   │   ├── curaduria/
│   │   ├── agenda/
│   │   ├── credenciales/
│   │   ├── kpis/
│   │   └── seguimiento/
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── queryClient.ts
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Modal.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useDebounce.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   └── constants/
│   │       └── index.ts
│   │
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   │
│   └── styles/
│       └── index.css
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Instalación:**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend

npm install react-router-dom
npm install @tanstack/react-query
npm install zustand
npm install axios

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
```

---

## 💾 FASE 3: DISEÑO DE BASE DE DATOS (Semana 2)

### 3.1 Esquema de Tablas PostgreSQL

```sql
-- Tabla: paises
CREATE TABLE paises (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(3) UNIQUE NOT NULL,  -- CHL, BRA, ARG, PRY, BOL
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: sectores
CREATE TABLE sectores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,       -- Logística, Energía, Tecnología, Turismo
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: empresas
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    pais_id INTEGER REFERENCES paises(id),
    sector_id INTEGER REFERENCES sectores(id),
    descripcion TEXT,
    sitio_web VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    logo_url VARCHAR(500),
    aprobada BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: participantes
CREATE TABLE participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    cargo VARCHAR(150),
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    idioma VARCHAR(2) DEFAULT 'ES',     -- ES o PT
    requiere_interprete BOOLEAN DEFAULT FALSE,
    foto_url VARCHAR(500),
    qr_data TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: curaduria (perfil empresa)
CREATE TABLE curaduria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    ofrece TEXT[],                      -- Array de palabras clave
    busca TEXT[],                       -- Array de palabras clave
    objetivos TEXT,
    capacidades TEXT,
    notas_internas TEXT,
    puntuacion_compatibilidad INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: bloques_horarios
CREATE TABLE bloques_horarios (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    ubicacion VARCHAR(100),             -- Sala A, B, C, etc.
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: reuniones
CREATE TABLE reuniones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bloque_id INTEGER REFERENCES bloques_horarios(id),
    empresa_a_id UUID REFERENCES empresas(id),
    empresa_b_id UUID REFERENCES empresas(id),
    estado VARCHAR(50) DEFAULT 'programada', -- programada, confirmada, realizada, cancelada
    notas TEXT,
    requiere_interprete BOOLEAN DEFAULT FALSE,
    sala VARCHAR(50),
    resultado TEXT,                     -- Notas post-reunión
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT no_self_meeting CHECK (empresa_a_id != empresa_b_id)
);

-- Tabla: mesas_tematicas
CREATE TABLE mesas_tematicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    sector_id INTEGER REFERENCES sectores(id),
    fecha_hora TIMESTAMP NOT NULL,
    duracion_minutos INTEGER DEFAULT 90,
    moderador VARCHAR(255),
    ubicacion VARCHAR(100),
    descripcion TEXT,
    capacidad INTEGER DEFAULT 30
);

-- Tabla: mesas_participantes (relación muchos a muchos)
CREATE TABLE mesas_participantes (
    mesa_id UUID REFERENCES mesas_tematicas(id) ON DELETE CASCADE,
    participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
    confirmado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (mesa_id, participante_id)
);

-- Tabla: rutas_turisticas
CREATE TABLE rutas_turisticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),                   -- logistica, energia, tecnologia, turismo
    fecha DATE NOT NULL,
    hora_salida TIME NOT NULL,
    duracion_horas DECIMAL(4,2),
    descripcion TEXT,
    itinerario TEXT,
    capacidad INTEGER DEFAULT 40,
    punto_encuentro VARCHAR(255)
);

-- Tabla: rutas_inscritos
CREATE TABLE rutas_inscritos (
    ruta_id UUID REFERENCES rutas_turisticas(id) ON DELETE CASCADE,
    participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
    confirmado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ruta_id, participante_id)
);

-- Tabla: seguimiento
CREATE TABLE seguimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id),
    tipo VARCHAR(50) NOT NULL,          -- acuerdo, loi, propuesta, seguimiento
    descripcion TEXT NOT NULL,
    responsable VARCHAR(255),
    fecha_compromiso DATE,
    estado VARCHAR(50) DEFAULT 'pendiente',
    documentos_url TEXT[],
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: kpis
CREATE TABLE kpis (
    id SERIAL PRIMARY KEY,
    fecha DATE DEFAULT CURRENT_DATE,
    empresas_meta INTEGER DEFAULT 100,
    empresas_actual INTEGER DEFAULT 0,
    reuniones_meta INTEGER DEFAULT 300,
    reuniones_actual INTEGER DEFAULT 0,
    acuerdos_meta INTEGER DEFAULT 20,
    acuerdos_actual INTEGER DEFAULT 0,
    satisfaccion_meta DECIMAL(5,2) DEFAULT 80.0,
    satisfaccion_actual DECIMAL(5,2) DEFAULT 0.0,
    ocupacion_agenda DECIMAL(5,2) DEFAULT 0.0,
    puntualidad DECIMAL(5,2) DEFAULT 0.0,
    nps DECIMAL(5,2) DEFAULT 0.0
);

-- Tabla: usuarios (administración)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'staff',    -- admin, coordinador, staff
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: ndas (acuerdos de confidencialidad)
CREATE TABLE ndas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participante_id UUID REFERENCES participantes(id),
    aceptado BOOLEAN DEFAULT FALSE,
    fecha_aceptacion TIMESTAMP,
    ip_address VARCHAR(50),
    documento_url VARCHAR(500)
);

-- Índices para optimización
CREATE INDEX idx_empresas_pais ON empresas(pais_id);
CREATE INDEX idx_empresas_sector ON empresas(sector_id);
CREATE INDEX idx_participantes_empresa ON participantes(empresa_id);
CREATE INDEX idx_reuniones_bloque ON reuniones(bloque_id);
CREATE INDEX idx_reuniones_empresas ON reuniones(empresa_a_id, empresa_b_id);
CREATE INDEX idx_seguimiento_empresa ON seguimiento(empresa_id);
```

### 3.2 Datos Iniciales (Seeds)

```sql
-- Insertar países
INSERT INTO paises (codigo, nombre) VALUES
    ('CHL', 'Chile'),
    ('BRA', 'Brasil'),
    ('ARG', 'Argentina'),
    ('PRY', 'Paraguay'),
    ('BOL', 'Bolivia');

-- Insertar sectores
INSERT INTO sectores (nombre, descripcion) VALUES
    ('Logística', 'Transporte y logística internacional'),
    ('Energía', 'Energía, minería y sostenibilidad'),
    ('Tecnología', 'Innovación y servicios digitales'),
    ('Turismo', 'Turismo corporativo y experiencias empresariales');
```

---

## 🔨 FASE 4: DESARROLLO BACKEND (Semana 3-5)

### 4.1 Configuración Inicial FastAPI

**backend/app/config.py**

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Conecta Empresas LATAM API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]

    # Email (opcional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**backend/app/main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1 import empresas, participantes, curaduria, agenda, kpis

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(empresas.router, prefix=f"{settings.API_V1_STR}/empresas", tags=["empresas"])
app.include_router(participantes.router, prefix=f"{settings.API_V1_STR}/participantes", tags=["participantes"])
app.include_router(curaduria.router, prefix=f"{settings.API_V1_STR}/curaduria", tags=["curaduria"])
app.include_router(agenda.router, prefix=f"{settings.API_V1_STR}/agenda", tags=["agenda"])
app.include_router(kpis.router, prefix=f"{settings.API_V1_STR}/kpis", tags=["kpis"])

@app.get("/")
def read_root():
    return {"message": "Conecta Empresas LATAM API", "version": settings.VERSION}
```

### 4.2 Modelos SQLAlchemy (Ejemplo)

**backend/app/models/empresa.py**

```python
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(255), nullable=False)
    pais_id = Column(Integer, ForeignKey("paises.id"))
    sector_id = Column(Integer, ForeignKey("sectores.id"))
    descripcion = Column(Text)
    sitio_web = Column(String(255))
    telefono = Column(String(50))
    email = Column(String(255))
    direccion = Column(Text)
    logo_url = Column(String(500))
    aprobada = Column(Boolean, default=False)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    pais = relationship("Pais", back_populates="empresas")
    sector = relationship("Sector", back_populates="empresas")
    participantes = relationship("Participante", back_populates="empresa", cascade="all, delete-orphan")
    curaduria = relationship("Curaduria", back_populates="empresa", uselist=False)
```

### 4.3 Schemas Pydantic (Ejemplo)

**backend/app/schemas/empresa.py**

```python
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from datetime import datetime
from uuid import UUID

class EmpresaBase(BaseModel):
    nombre: str
    pais_id: int
    sector_id: int
    descripcion: Optional[str] = None
    sitio_web: Optional[HttpUrl] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    telefono: Optional[str] = None
    # ... otros campos opcionales

class EmpresaInDB(EmpresaBase):
    id: UUID
    logo_url: Optional[str] = None
    aprobada: bool
    fecha_registro: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmpresaResponse(EmpresaInDB):
    pais_nombre: Optional[str] = None
    sector_nombre: Optional[str] = None
```

### 4.4 Endpoints API (Ejemplo)

**backend/app/api/v1/empresas.py**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas.empresa import EmpresaCreate, EmpresaResponse, EmpresaUpdate
from app.models.empresa import Empresa
from app.models.pais import Pais
from app.models.sector import Sector

router = APIRouter()

@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
def create_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    """Registrar nueva empresa"""
    db_empresa = Empresa(**empresa.dict())
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@router.get("/", response_model=List[EmpresaResponse])
def list_empresas(
    skip: int = 0,
    limit: int = 100,
    pais_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Listar empresas con filtros opcionales"""
    query = db.query(Empresa)

    if pais_id:
        query = query.filter(Empresa.pais_id == pais_id)
    if sector_id:
        query = query.filter(Empresa.sector_id == sector_id)

    empresas = query.offset(skip).limit(limit).all()
    return empresas

@router.get("/{empresa_id}", response_model=EmpresaResponse)
def get_empresa(empresa_id: UUID, db: Session = Depends(get_db)):
    """Obtener empresa por ID"""
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

@router.put("/{empresa_id}", response_model=EmpresaResponse)
def update_empresa(
    empresa_id: UUID,
    empresa_update: EmpresaUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar empresa"""
    db_empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    for field, value in empresa_update.dict(exclude_unset=True).items():
        setattr(db_empresa, field, value)

    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@router.delete("/{empresa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_empresa(empresa_id: UUID, db: Session = Depends(get_db)):
    """Eliminar empresa"""
    db_empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    db.delete(db_empresa)
    db.commit()
    return None
```

### 4.5 Servicios Especializados

**backend/app/services/matching_service.py**

```python
from typing import List, Dict
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.empresa import Empresa
from app.models.curaduria import Curaduria

class MatchingService:
    """Servicio para calcular compatibilidad entre empresas"""

    @staticmethod
    def calculate_matches(db: Session, min_score: int = 1) -> List[Dict]:
        """
        Calcula compatibilidades entre empresas basándose en:
        - Mismo sector
        - Palabras clave en ofrece/busca
        """
        empresas = db.query(Empresa).filter(Empresa.aprobada == True).all()
        matches = []

        for i, emp_a in enumerate(empresas):
            curaduria_a = db.query(Curaduria).filter(
                Curaduria.empresa_id == emp_a.id
            ).first()

            if not curaduria_a:
                continue

            for emp_b in empresas[i+1:]:
                curaduria_b = db.query(Curaduria).filter(
                    Curaduria.empresa_id == emp_b.id
                ).first()

                if not curaduria_b:
                    continue

                score, keywords = MatchingService._calculate_compatibility(
                    curaduria_a, curaduria_b, emp_a, emp_b
                )

                if score >= min_score:
                    matches.append({
                        "empresa_a_id": str(emp_a.id),
                        "empresa_a_nombre": emp_a.nombre,
                        "empresa_b_id": str(emp_b.id),
                        "empresa_b_nombre": emp_b.nombre,
                        "score": score,
                        "keywords_match": keywords
                    })

        # Ordenar por score descendente
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches

    @staticmethod
    def _calculate_compatibility(
        cur_a: Curaduria,
        cur_b: Curaduria,
        emp_a: Empresa,
        emp_b: Empresa
    ) -> tuple[int, List[str]]:
        """Calcula score y palabras clave coincidentes"""
        score = 0
        matched_keywords = []

        # +2 puntos si son del mismo sector
        if emp_a.sector_id == emp_b.sector_id:
            score += 2

        # Intersección de keywords
        kw_a = set(cur_a.ofrece or []) | set(cur_a.busca or [])
        kw_b = set(cur_b.ofrece or []) | set(cur_b.busca or [])

        intersection = kw_a & kw_b
        matched_keywords = list(intersection)
        score += len(matched_keywords)

        return score, matched_keywords
```

**backend/app/services/qr_service.py**

```python
import qrcode
import json
import base64
from io import BytesIO
from typing import Dict

class QRService:
    """Servicio para generar códigos QR de credenciales"""

    @staticmethod
    def generate_qr(data: Dict) -> str:
        """
        Genera QR code y retorna imagen en base64

        Args:
            data: Diccionario con información del participante

        Returns:
            String base64 de la imagen PNG
        """
        # Convertir data a JSON
        json_data = json.dumps(data, ensure_ascii=False)

        # Crear QR
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(json_data)
        qr.make(fit=True)

        # Generar imagen
        img = qr.make_image(fill_color="black", back_color="white")

        # Convertir a base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()

        return f"data:image/png;base64,{img_str}"
```

---

## 🎨 FASE 5: DESARROLLO FRONTEND (Semana 5-8)

### 5.1 Sistema de Diseño - Paleta de Colores

**frontend/src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colores principales - Azul profesional */
    --primary: 210 100% 50%; /* Azul vibrante #0080FF */
    --primary-dark: 210 100% 40%; /* Azul oscuro #0066CC */
    --primary-light: 210 100% 95%; /* Azul muy claro #E6F2FF */

    /* Neutrales - Blancos y grises */
    --background: 0 0% 100%; /* Blanco puro */
    --surface: 210 20% 98%; /* Gris muy claro azulado */
    --surface-dark: 210 15% 95%; /* Gris claro */

    /* Textos */
    --text-primary: 210 30% 15%; /* Casi negro azulado */
    --text-secondary: 210 15% 45%; /* Gris medio */
    --text-muted: 210 10% 65%; /* Gris claro */

    /* Acentos */
    --success: 142 76% 36%; /* Verde */
    --warning: 38 92% 50%; /* Naranja */
    --error: 0 84% 60%; /* Rojo */
    --info: 199 89% 48%; /* Azul cyan */

    /* Bordes y sombras */
    --border: 210 20% 90%;
    --shadow: 210 30% 10%;

    /* Radios */
    --radius: 0.75rem;
  }
}

/* Utilidades personalizadas */
@layer components {
  .card-premium {
    @apply bg-white rounded-2xl shadow-lg border border-gray-100 p-6;
  }

  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg;
  }

  .btn-secondary {
    @apply bg-white hover:bg-gray-50 text-blue-600 font-semibold px-6 py-3 rounded-xl border-2 border-blue-600 transition-all duration-200;
  }

  .input-modern {
    @apply w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors;
  }

  .badge-status {
    @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
  }
}
```

**tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0080FF",
          50: "#E6F2FF",
          100: "#CCE5FF",
          200: "#99CCFF",
          300: "#66B2FF",
          400: "#3399FF",
          500: "#0080FF",
          600: "#0066CC",
          700: "#004D99",
          800: "#003366",
          900: "#001A33",
        },
        neutral: {
          50: "#FAFBFC",
          100: "#F5F7FA",
          200: "#E4E7EB",
          300: "#CBD2D9",
          400: "#9AA5B1",
          500: "#7B8794",
          600: "#616E7C",
          700: "#52606D",
          800: "#3E4C59",
          900: "#323F4B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 128, 255, 0.08)",
        medium: "0 4px 16px rgba(0, 128, 255, 0.12)",
        large: "0 8px 32px rgba(0, 128, 255, 0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 5.2 Layout Principal

**frontend/src/app/layout.tsx**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Conecta Empresas LATAM | Antofagasta 2025",
  description: "Plataforma B2B para conexiones empresariales en Latinoamérica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**frontend/src/components/layout/Navbar.tsx**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  GitBranch,
  Calendar,
  CreditCard,
  BarChart3,
  FileCheck,
} from "lucide-react";

const navItems = [
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/participantes", label: "Participantes", icon: Users },
  { href: "/curaduria", label: "Curaduría", icon: GitBranch },
  { href: "/agenda", label: "Agenda B2B", icon: Calendar },
  { href: "/credenciales", label: "Credenciales", icon: CreditCard },
  { href: "/kpis", label: "KPIs", icon: BarChart3 },
  { href: "/seguimiento", label: "Seguimiento", icon: FileCheck },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">CE</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Conecta Empresas LATAM
                </h1>
                <p className="text-sm text-gray-500">Antofagasta 2025</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

### 5.3 Ejemplo de Página - Empresas

**frontend/src/app/empresas/page.tsx**

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmpresaCard } from "@/components/empresas/EmpresaCard";
import { EmpresaModal } from "@/components/empresas/EmpresaModal";
import { api } from "@/lib/api";

export default function EmpresasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: empresas, isLoading } = useQuery({
    queryKey: ["empresas"],
    queryFn: () => api.empresas.getAll(),
  });

  const filteredEmpresas = empresas?.filter((emp) =>
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Empresas Participantes
          </h1>
          <p className="text-gray-600">
            Gestiona las empresas registradas para Conecta Empresas LATAM
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-premium">
            <p className="text-sm text-gray-600 mb-1">Total Empresas</p>
            <p className="text-3xl font-bold text-gray-900">
              {empresas?.length || 0}
            </p>
          </div>
          <div className="card-premium">
            <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
            <p className="text-3xl font-bold text-green-600">
              {empresas?.filter((e) => e.aprobada).length || 0}
            </p>
          </div>
          <div className="card-premium">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-orange-600">
              {empresas?.filter((e) => !e.aprobada).length || 0}
            </p>
          </div>
          <div className="card-premium">
            <p className="text-sm text-gray-600 mb-1">Países</p>
            <p className="text-3xl font-bold text-blue-600">
              {new Set(empresas?.map((e) => e.pais_id)).size || 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="card-premium mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>

            <Button variant="outline" className="btn-secondary">
              <Filter size={18} className="mr-2" />
              Filtros
            </Button>

            <Button variant="outline" className="btn-secondary">
              <Download size={18} className="mr-2" />
              Exportar
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={18} className="mr-2" />
              Nueva Empresa
            </Button>
          </div>
        </div>

        {/* Grid de empresas */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando empresas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmpresas?.map((empresa) => (
              <EmpresaCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        )}

        {/* Modal */}
        <EmpresaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
```

### 5.4 Cliente API

**frontend/src/lib/api.ts**

```typescript
import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Empresas
  empresas: {
    getAll: async (params?: any) => {
      const { data } = await client.get("/empresas", { params });
      return data;
    },
    getById: async (id: string) => {
      const { data } = await client.get(`/empresas/${id}`);
      return data;
    },
    create: async (empresa: any) => {
      const { data } = await client.post("/empresas", empresa);
      return data;
    },
    update: async (id: string, empresa: any) => {
      const { data } = await client.put(`/empresas/${id}`, empresa);
      return data;
    },
    delete: async (id: string) => {
      await client.delete(`/empresas/${id}`);
    },
  },

  // Participantes
  participantes: {
    getAll: async (params?: any) => {
      const { data } = await client.get("/participantes", { params });
      return data;
    },
    create: async (participante: any) => {
      const { data } = await client.post("/participantes", participante);
      return data;
    },
  },

  // Curaduría
  curaduria: {
    save: async (empresaId: string, perfil: any) => {
      const { data } = await client.post(`/curaduria/${empresaId}`, perfil);
      return data;
    },
    getMatches: async () => {
      const { data } = await client.get("/curaduria/matches");
      return data;
    },
  },

  // KPIs
  kpis: {
    getCurrent: async () => {
      const { data } = await client.get("/kpis/current");
      return data;
    },
    update: async (kpis: any) => {
      const { data } = await client.post("/kpis", kpis);
      return data;
    },
  },
};
```

---

## 🚀 FASE 6: INTEGRACIÓN Y TESTING (Semana 9)

### 6.1 Testing Backend

**backend/tests/test_empresas.py**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_empresa():
    response = client.post(
        "/api/v1/empresas/",
        json={
            "nombre": "ALOG Group",
            "pais_id": 1,
            "sector_id": 1,
            "descripcion": "Empresa de logística",
            "email": "contacto@alog.com"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "ALOG Group"
    assert "id" in data

def test_list_empresas():
    response = client.get("/api/v1/empresas/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### 6.2 Testing Frontend

**frontend/src/**tests**/EmpresaCard.test.tsx**

```typescript
import { render, screen } from "@testing-library/react";
import { EmpresaCard } from "@/components/empresas/EmpresaCard";

describe("EmpresaCard", () => {
  const mockEmpresa = {
    id: "123",
    nombre: "Test Company",
    pais_nombre: "Chile",
    sector_nombre: "Logística",
    aprobada: true,
  };

  it("renders empresa name", () => {
    render(<EmpresaCard empresa={mockEmpresa} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  it("shows approved badge", () => {
    render(<EmpresaCard empresa={mockEmpresa} />);
    expect(screen.getByText("Aprobada")).toBeInTheDocument();
  });
});
```

---

## 📦 FASE 7: DEPLOYMENT (Semana 10)

### 7.1 Backend - Railway/Render

**Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 7.2 Frontend - Vercel

**vercel.json**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

---

## ✅ CHECKLIST DE MIGRACIÓN

### Backend

- [ ] Configurar PostgreSQL/Supabase
- [ ] Crear modelos SQLAlchemy (10 tablas)
- [ ] Implementar schemas Pydantic
- [ ] Desarrollar endpoints CRUD
- [ ] Servicio de matching
- [ ] Servicio de QR/credenciales
- [ ] Servicio de exportación (CSV/PDF)
- [ ] Autenticación JWT
- [ ] Tests unitarios (>70% coverage)
- [ ] Documentación OpenAPI

### Frontend

- [ ] Configurar Next.js + Tailwind
- [ ] Implementar sistema de diseño azul/blanco
- [ ] Layout principal + navegación
- [ ] Página Empresas (CRUD)
- [ ] Página Participantes (CRUD)
- [ ] Página Curaduría + Matching
- [ ] Página Agenda B2B
- [ ] Página Credenciales + QR
- [ ] Dashboard KPIs con gráficos
- [ ] Página Seguimiento
- [ ] Exportaciones (CSV/PDF)
- [ ] Internacionalización ES/PT
- [ ] Responsive design
- [ ] Tests E2E

### Integración

- [ ] Conectar frontend con API
- [ ] Manejo de errores global
- [ ] Loading states
- [ ] Validaciones cliente/servidor
- [ ] Optimistic updates
- [ ] Cache con React Query

### DevOps

- [ ] CI/CD pipeline
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Variables de entorno
- [ ] Monitoreo y logs
- [ ] Backups automáticos

---

## 📅 CRONOGRAMA RESUMIDO

| Semana | Fase              | Entregables                           |
| ------ | ----------------- | ------------------------------------- |
| 1      | Análisis y setup  | Arquitectura definida, repos creados  |
| 2      | Base de datos     | Schema PostgreSQL, modelos SQLAlchemy |
| 3-4    | Backend core      | APIs CRUD, servicios básicos          |
| 5      | Backend avanzado  | Matching, QR, exports, tests          |
| 6-7    | Frontend base     | Layout, páginas principales, UI       |
| 8      | Frontend avanzado | Dashboards, KPIs, exportaciones       |
| 9      | Integración       | Frontend ↔ Backend, tests E2E         |
| 10     | Deploy            | Producción, documentación             |

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Crear estructura de carpetas backend**
2. **Configurar base de datos PostgreSQL en Supabase**
3. **Implementar modelo Empresa + Participante + CRUD**
4. **Crear proyecto Next.js con Tailwind**
5. **Diseñar componentes UI base (botones, cards, inputs)**
6. **Conectar primera página (Empresas) con API**

---

## 📚 RECURSOS Y DOCUMENTACIÓN

- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **React Query**: https://tanstack.com/query/latest

---

**Organización**: ConfíaGo  
**Proyecto**: Conecta Empresas LATAM  
**Versión**: 1.0  
**Fecha**: Noviembre 2025
