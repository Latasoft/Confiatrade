# ConfíaTrade - Arquitectura del Sistema

## 1. MODELO DE DATOS

### 1.1 Entidades Principales

```
EMPRESAS
├── id: UUID (PK)
├── nombre: String(255)
├── pais_id: Integer (FK → paises.id)
├── sector_id: Integer (FK → sectores.id)
├── descripcion: Text
├── sitio_web: String(255)
├── telefono: String(50)
├── email: String(255)
├── direccion: Text
├── logo_url: String(500)
├── aprobada: Boolean
├── fecha_registro: DateTime
└── updated_at: DateTime

PARTICIPANTES
├── id: UUID (PK)
├── empresa_id: UUID (FK → empresas.id)
├── nombre_completo: String(255)
├── cargo: String(150)
├── email: String(255) UNIQUE
├── telefono: String(50)
├── idioma: String(2) ['ES', 'PT']
├── requiere_interprete: Boolean
├── foto_url: String(500)
├── qr_data: Text
├── fecha_registro: DateTime
└── updated_at: DateTime

CURADURIA
├── id: UUID (PK)
├── empresa_id: UUID (FK → empresas.id)
├── ofrece: Text[]
├── busca: Text[]
├── objetivos: Text
├── capacidades: Text
├── notas_internas: Text
├── puntuacion_compatibilidad: Integer
└── updated_at: DateTime

BLOQUES_HORARIOS
├── id: Serial (PK)
├── fecha: Date
├── hora_inicio: Time
├── hora_fin: Time
├── duracion_minutos: Integer
├── ubicacion: String(100)
└── activo: Boolean

REUNIONES
├── id: UUID (PK)
├── bloque_id: Integer (FK → bloques_horarios.id)
├── empresa_a_id: UUID (FK → empresas.id)
├── empresa_b_id: UUID (FK → empresas.id)
├── estado: Enum ['programada', 'confirmada', 'realizada', 'cancelada']
├── notas: Text
├── requiere_interprete: Boolean
├── sala: String(50)
├── resultado: Text
├── created_at: DateTime
└── updated_at: DateTime
└── CONSTRAINT: empresa_a_id ≠ empresa_b_id

MESAS_TEMATICAS
├── id: UUID (PK)
├── nombre: String(255)
├── sector_id: Integer (FK → sectores.id)
├── fecha_hora: DateTime
├── duracion_minutos: Integer
├── moderador: String(255)
├── ubicacion: String(100)
├── descripcion: Text
└── capacidad: Integer

MESAS_PARTICIPANTES (N:N)
├── mesa_id: UUID (FK → mesas_tematicas.id)
├── participante_id: UUID (FK → participantes.id)
└── confirmado: Boolean

RUTAS_TURISTICAS
├── id: UUID (PK)
├── nombre: String(255)
├── tipo: Enum ['logistica', 'energia', 'tecnologia', 'turismo']
├── fecha: Date
├── hora_salida: Time
├── duracion_horas: Decimal(4,2)
├── descripcion: Text
├── itinerario: Text
├── capacidad: Integer
└── punto_encuentro: String(255)

RUTAS_INSCRITOS (N:N)
├── ruta_id: UUID (FK → rutas_turisticas.id)
├── participante_id: UUID (FK → participantes.id)
└── confirmado: Boolean

SEGUIMIENTO
├── id: UUID (PK)
├── empresa_id: UUID (FK → empresas.id)
├── tipo: Enum ['acuerdo', 'loi', 'propuesta', 'seguimiento']
├── descripcion: Text
├── responsable: String(255)
├── fecha_compromiso: Date
├── estado: Enum ['pendiente', 'en_progreso', 'completado', 'cancelado']
├── documentos_url: Text[]
├── notas: Text
├── created_at: DateTime
└── updated_at: DateTime

KPIS
├── id: Serial (PK)
├── fecha: Date
├── empresas_meta: Integer
├── empresas_actual: Integer
├── reuniones_meta: Integer
├── reuniones_actual: Integer
├── acuerdos_meta: Integer
├── acuerdos_actual: Integer
├── satisfaccion_meta: Decimal(5,2)
├── satisfaccion_actual: Decimal(5,2)
├── ocupacion_agenda: Decimal(5,2)
├── puntualidad: Decimal(5,2)
└── nps: Decimal(5,2)

USUARIOS
├── id: UUID (PK)
├── email: String(255) UNIQUE
├── hashed_password: String(255)
├── nombre_completo: String(255)
├── rol: Enum ['admin', 'coordinador', 'staff']
├── activo: Boolean
└── created_at: DateTime

NDAS
├── id: UUID (PK)
├── participante_id: UUID (FK → participantes.id)
├── aceptado: Boolean
├── fecha_aceptacion: DateTime
├── ip_address: String(50)
└── documento_url: String(500)
```

### 1.2 Catálogos

```
PAISES
├── id: Serial (PK)
├── codigo: String(3) UNIQUE ['CHL', 'BRA', 'ARG', 'PRY', 'BOL']
├── nombre: String(100)
└── activo: Boolean

SECTORES
├── id: Serial (PK)
├── nombre: String(100) ['Logística', 'Energía', 'Tecnología', 'Turismo']
├── descripcion: String(500)
└── activo: Boolean
```

### 1.3 Relaciones

```
empresas → participantes (1:N)
empresas → curaduria (1:1)
empresas → seguimiento (1:N)
bloques_horarios → reuniones (1:N)
empresas ← reuniones (N:1)
mesas_tematicas ↔ participantes (N:N)
rutas_turisticas ↔ participantes (N:N)
participantes → ndas (1:1)
paises → empresas (1:N)
sectores → empresas (1:N)
sectores → mesas_tematicas (1:N)
```

---

## 2. ELEMENTOS DE LA ARQUITECTURA

### 2.1 Backend - Clean Architecture (Hexagonal)

```
┌─────────────────────────────────────────────────────┐
│                  API LAYER                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ REST Controllers (FastAPI)                   │  │
│  │ - Request validation (Pydantic)              │  │
│  │ - Response serialization                     │  │
│  │ - HTTP error handling                        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              DOMAIN LAYER (CORE)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ Entities (Business Objects)                  │  │
│  │ - Pure domain logic                          │  │
│  │ - No dependencies on infrastructure          │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Use Cases (Application Logic)                │  │
│  │ - Orchestrate business rules                 │  │
│  │ - Define ports (interfaces)                  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Interfaces (Ports)                           │  │
│  │ - Repository contracts                       │  │
│  │ - Service contracts                          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│          INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Repositories (Adapters)                      │  │
│  │ - PostgreSQL implementation                  │  │
│  │ - ORM models (SQLAlchemy)                    │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ External Services                            │  │
│  │ - Email service                              │  │
│  │ - Storage service                            │  │
│  │ - QR generator                               │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Principios clave:

- **Dependency Inversion**: Core no depende de Infrastructure
- **Single Responsibility**: Cada capa tiene una responsabilidad clara
- **Open/Closed**: Abierto a extensión, cerrado a modificación
- **Interface Segregation**: Interfaces pequeñas y específicas
- **Dependency Injection**: Inyección de dependencias vía FastAPI

### 2.2 Frontend - Feature-Based Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Pages (Smart Components)                     │  │
│  │ - Route handlers                             │  │
│  │ - Data fetching orchestration                │  │
│  │ - State management                           │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Components (Dumb Components)                 │  │
│  │ - Pure UI components                         │  │
│  │ - Receive props, emit events                 │  │
│  │ - No business logic                          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                   LOGIC                             │
│  ┌──────────────────────────────────────────────┐  │
│  │ Custom Hooks                                 │  │
│  │ - Business logic encapsulation               │  │
│  │ - Reusable stateful logic                    │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ State Management (Zustand)                   │  │
│  │ - Global state                               │  │
│  │ - Derived state                              │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                   DATA                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ API Layer                                    │  │
│  │ - HTTP client                                │  │
│  │ - Request/Response handlers                  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ React Query                                  │  │
│  │ - Server state management                    │  │
│  │ - Caching strategy                           │  │
│  │ - Background refetching                      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. FLUJOS DE NEGOCIO

### 3.1 Registro de Empresa

```
Usuario → Formulario Registro
    ↓
Validación cliente (Zod)
    ↓
POST /api/v1/empresas
    ↓
CreateEmpresaUseCase
    ├→ Validar datos
    ├→ Crear entidad Empresa
    └→ EmpresaRepository.create()
        ↓
    PostgreSQL INSERT
        ↓
    Return Empresa creada
        ↓
Invalidar cache React Query
    ↓
Mostrar notificación success
```

### 3.2 Cálculo de Matches (Curaduría)

```
Admin → Botón "Calcular Compatibilidades"
    ↓
GET /api/v1/curaduria/matches
    ↓
CalculateMatchesUseCase
    ├→ Obtener todas empresas aprobadas
    ├→ Para cada par de empresas:
    │   ├→ Comparar sectores
    │   ├→ Comparar keywords (ofrece/busca)
    │   └→ Calcular score
    └→ Filtrar por score mínimo
        ↓
    Return lista de matches ordenada
        ↓
Cache resultado (5 min)
    ↓
Mostrar tabla de compatibilidades
```

### 3.3 Asignación de Reunión

```
Admin → Seleccionar Empresa A, Empresa B, Bloque
    ↓
Validación frontend:
    ├→ A ≠ B
    └→ Bloque disponible
        ↓
POST /api/v1/agenda/reuniones
    ↓
CreateReunionUseCase
    ├→ Validar empresas existen
    ├→ Validar bloque disponible
    ├→ Verificar conflictos horarios
    └→ ReunionRepository.create()
        ↓
    PostgreSQL INSERT
        ↓
Invalidar cache de reuniones y agenda
    ↓
Enviar notificaciones email (async)
    ↓
Mostrar notificación success
```

### 3.4 Generación de Credencial con QR

```
Admin → Seleccionar Participante
    ↓
GET /api/v1/credenciales/{participante_id}
    ↓
GenerateCredencialUseCase
    ├→ Obtener datos participante
    ├→ Obtener datos empresa
    └→ QRService.generate()
        ├→ Crear payload JSON
        └→ Generar QR code (base64)
            ↓
    Return credencial completa
        ↓
Renderizar preview credencial
    ↓
Opción: Exportar PDF
```

### 3.5 Actualización de KPIs

```
Sistema → Cron job diario (00:00)
    ↓
UpdateKPIsUseCase
    ├→ Contar empresas registradas
    ├→ Contar reuniones programadas
    ├→ Contar acuerdos (seguimiento tipo='acuerdo')
    ├→ Calcular satisfacción promedio
    ├→ Calcular ocupación agenda
    ├→ Calcular puntualidad
    └→ Calcular NPS
        ↓
    KPIRepository.update()
        ↓
    PostgreSQL UPDATE
        ↓
Cache invalidado
    ↓
Dashboard actualizado en tiempo real (websocket)
```

---

## 4. SISTEMA DE MENSAJERÍA CENTRALIZADA

### 4.1 Backend - Exception Handling

```python
# exceptions/base.py

class ConfiaTradException(Exception):
    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = 500,
        details: dict = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(ConfiaTradException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422,
            details=details
        )


class NotFoundException(ConfiaTradException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} con id {identifier} no encontrado",
            code="NOT_FOUND",
            status_code=404,
            details={"resource": resource, "id": identifier}
        )


class ConflictException(ConfiaTradException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=409,
            details=details
        )
```

```python
# middleware/error_handler.py

from fastapi import Request, status
from fastapi.responses import JSONResponse
from exceptions.base import ConfiaTradException
import logging

logger = logging.getLogger(__name__)


async def error_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except ConfiaTradException as e:
        logger.warning(
            f"Business exception: {e.code} - {e.message}",
            extra={"details": e.details}
        )
        return JSONResponse(
            status_code=e.status_code,
            content={
                "error": {
                    "code": e.code,
                    "message": e.message,
                    "details": e.details
                }
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "Error interno del servidor",
                    "details": {}
                }
            }
        )
```

### 4.2 Frontend - Notification System

```typescript
// shared/store/notificationStore.ts

import { create } from "zustand";

export type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  add: (notification) => {
    const id = Math.random().toString(36).slice(2);
    const duration = notification.duration || 5000;

    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  remove: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clear: () => {
    set({ notifications: [] });
  },
}));

// Hook helper
export function useNotification() {
  const add = useNotificationStore((state) => state.add);

  return {
    success: (message: string, description?: string) => {
      add({ type: "success", message, description });
    },
    error: (message: string, description?: string) => {
      add({ type: "error", message, description });
    },
    warning: (message: string, description?: string) => {
      add({ type: "warning", message, description });
    },
    info: (message: string, description?: string) => {
      add({ type: "info", message, description });
    },
  };
}
```

### 4.3 Service Layer - Async Tasks

```python
# services/background/task_queue.py

from typing import Callable, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

logger = logging.getLogger(__name__)


class TaskQueue:
    def __init__(self, max_workers: int = 5):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.tasks = []

    def enqueue(
        self,
        func: Callable,
        *args,
        retry_count: int = 3,
        retry_delay: int = 5,
        **kwargs
    ):
        task = asyncio.create_task(
            self._execute_with_retry(func, args, kwargs, retry_count, retry_delay)
        )
        self.tasks.append(task)
        return task

    async def _execute_with_retry(
        self,
        func: Callable,
        args: tuple,
        kwargs: dict,
        retry_count: int,
        retry_delay: int
    ):
        for attempt in range(retry_count):
            try:
                result = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    func,
                    *args,
                    **kwargs
                )
                logger.info(f"Task {func.__name__} completed successfully")
                return result
            except Exception as e:
                logger.warning(
                    f"Task {func.__name__} failed (attempt {attempt + 1}/{retry_count}): {str(e)}"
                )
                if attempt < retry_count - 1:
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"Task {func.__name__} failed after {retry_count} attempts")
                    raise


task_queue = TaskQueue()
```

```python
# services/email/email_service.py

from services.background.task_queue import task_queue
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self, smtp_host: str, smtp_port: int, username: str, password: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password

    def send_email_sync(
        self,
        to: str,
        subject: str,
        body: str,
        html: bool = False
    ):
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.username
        msg['To'] = to

        content = MIMEText(body, 'html' if html else 'plain', 'utf-8')
        msg.attach(content)

        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)

        logger.info(f"Email sent to {to}: {subject}")

    def send_email_async(
        self,
        to: str,
        subject: str,
        body: str,
        html: bool = False,
        retry_count: int = 3
    ):
        task_queue.enqueue(
            self.send_email_sync,
            to=to,
            subject=subject,
            body=body,
            html=html,
            retry_count=retry_count,
            retry_delay=10
        )
```

---

## 5. GESTIÓN DE QUERIES Y CACHÉ

### 5.1 React Query Configuration

```typescript
// shared/api/queryClient.ts

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 401) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        console.error("Mutation error:", error);
      },
    },
  },
});
```

### 5.2 API Client con Interceptors

```typescript
// shared/api/client.ts

import axios, { AxiosError } from "axios";
import { useNotificationStore } from "@/shared/store/notificationStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      error: { code: string; message: string; details: any };
    }>
  ) => {
    const { add } = useNotificationStore.getState();

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      add({
        type: "error",
        message: "Sesión expirada",
        description: "Por favor, inicia sesión nuevamente",
      });
    } else if (error.response?.data?.error) {
      const { message, code } = error.response.data.error;
      add({
        type: "error",
        message: message,
        description: `Código: ${code}`,
      });
    } else if (error.code === "ECONNABORTED") {
      add({
        type: "error",
        message: "Tiempo de espera agotado",
        description: "La solicitud tardó demasiado",
      });
    } else if (!error.response) {
      add({
        type: "error",
        message: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
    }

    return Promise.reject(error);
  }
);
```

### 5.3 Cache Strategy por Feature

```typescript
// features/empresas/hooks/useEmpresas.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresasApi } from "../api/empresasApi";
import { useNotification } from "@/shared/store/notificationStore";

export const EMPRESAS_KEYS = {
  all: ["empresas"] as const,
  lists: () => [...EMPRESAS_KEYS.all, "list"] as const,
  list: (filters: any) => [...EMPRESAS_KEYS.lists(), filters] as const,
  details: () => [...EMPRESAS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EMPRESAS_KEYS.details(), id] as const,
};

export function useEmpresas(filters?: {
  pais_id?: number;
  sector_id?: number;
}) {
  return useQuery({
    queryKey: EMPRESAS_KEYS.list(filters || {}),
    queryFn: () => empresasApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmpresa(id: string) {
  return useQuery({
    queryKey: EMPRESAS_KEYS.detail(id),
    queryFn: () => empresasApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient();
  const notification = useNotification();

  return useMutation({
    mutationFn: empresasApi.create,
    onMutate: async (newEmpresa) => {
      await queryClient.cancelQueries({ queryKey: EMPRESAS_KEYS.lists() });

      const previousEmpresas = queryClient.getQueryData(EMPRESAS_KEYS.lists());

      queryClient.setQueryData(EMPRESAS_KEYS.lists(), (old: any) => {
        return old ? [...old, { ...newEmpresa, id: "temp-id" }] : [newEmpresa];
      });

      return { previousEmpresas };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        EMPRESAS_KEYS.lists(),
        context?.previousEmpresas
      );
      notification.error("Error al crear empresa");
    },
    onSuccess: (data) => {
      notification.success("Empresa creada exitosamente");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EMPRESAS_KEYS.lists() });
    },
  });
}
```

---

## 6. UI/UX DESIGN SYSTEM

### 6.1 Paleta de Colores

```css
/* Primarios */
--primary-50:  #E6F2FF
--primary-100: #CCE5FF
--primary-200: #99CCFF
--primary-300: #66B2FF
--primary-400: #3399FF
--primary-500: #0080FF  /* Principal */
--primary-600: #0066CC
--primary-700: #004D99
--primary-800: #003366
--primary-900: #001A33

/* Neutrales */
--neutral-50:  #FAFBFC
--neutral-100: #F5F7FA
--neutral-200: #E4E7EB
--neutral-300: #CBD2D9
--neutral-400: #9AA5B1
--neutral-500: #7B8794
--neutral-600: #616E7C
--neutral-700: #52606D
--neutral-800: #3E4C59
--neutral-900: #323F4B

/* Semánticos */
--success: #10B981
--warning: #F59E0B
--error:   #EF4444
--info:    #3B82F6
```

### 6.2 Tipografía

```
Font Family: Inter (system-ui fallback)

Sizes:
- text-xs:   12px / 16px
- text-sm:   14px / 20px
- text-base: 16px / 24px
- text-lg:   18px / 28px
- text-xl:   20px / 28px
- text-2xl:  24px / 32px
- text-3xl:  30px / 36px
- text-4xl:  36px / 40px

Weights:
- regular: 400
- medium:  500
- semibold: 600
- bold:    700
```

### 6.3 Espaciado

```
Scale: 4px base

0:  0px
1:  4px
2:  8px
3:  12px
4:  16px
5:  20px
6:  24px
8:  32px
10: 40px
12: 48px
16: 64px
20: 80px
```

### 6.4 Componentes Base

```
Button:
- Height: 40px (md), 48px (lg)
- Padding: 16px 24px
- Border Radius: 12px
- Font Weight: 600

Input:
- Height: 44px
- Padding: 12px 16px
- Border: 2px solid
- Border Radius: 12px
- Focus: border-primary-500

Card:
- Background: white
- Border: 1px solid neutral-200
- Border Radius: 16px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)

Table:
- Row Height: 56px
- Header Background: neutral-50
- Border: neutral-200
- Hover: neutral-50
```

### 6.5 Patrones de Interacción

```
Loading States:
- Skeleton screens para contenido
- Spinner para acciones
- Progress bar para procesos largos

Empty States:
- Ilustración + mensaje + CTA
- Centrado vertical y horizontal

Error States:
- Mensaje claro y accionable
- Botón de reintento
- Link a soporte si persiste

Success States:
- Notificación toast (5s)
- Feedback visual en botón
- Actualización optimista de UI
```

---

## 7. RESUMEN DE DECISIONES TÉCNICAS

| Aspecto                   | Decisión                                | Razón                                                                   |
| ------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| **Arquitectura Backend**  | Clean Architecture (Hexagonal)          | Testabilidad, mantenibilidad, independencia de frameworks               |
| **Arquitectura Frontend** | Feature-based                           | Escalabilidad, encapsulación, co-location de código relacionado         |
| **Manejo de Errores**     | Centralizado con middleware             | Consistencia, logging, UX uniforme                                      |
| **Notificaciones**        | Zustand store + Toast                   | Estado global, fácil de usar desde cualquier lugar                      |
| **Cache**                 | React Query                             | Sincronización servidor-cliente, optimistic updates, refetch automático |
| **Async Tasks**           | ThreadPoolExecutor + retry              | Ejecución en background, tolerancia a fallos                            |
| **Validación**            | Pydantic (backend) + Zod (frontend)     | Type safety, validación en ambas capas                                  |
| **Base de Datos**         | PostgreSQL                              | Relacional, transaccional, soporte UUID                                 |
| **ORM**                   | SQLAlchemy                              | Maduro, flexible, soporte async                                         |
| **Routing**               | React Router v6                         | Estándar de facto, code splitting                                       |
| **Estilos**               | Tailwind CSS                            | Utilidad-first, consistencia, desarrollo rápido                         |
| **State Management**      | Zustand (global) + React Query (server) | Mínimo boilerplate, performance                                         |

---

## 8. PRÓXIMOS PASOS DE IMPLEMENTACIÓN

1. Crear migraciones Alembic para todas las tablas
2. Implementar sistema de excepciones centralizado
3. Implementar sistema de notificaciones frontend
4. Completar repositorios y use cases para todas las entidades
5. Implementar servicio de email con retry
6. Crear componentes base del design system
7. Implementar autenticación JWT
8. Desarrollar features restantes
9. Tests unitarios y de integración
10. Documentación API (OpenAPI)
