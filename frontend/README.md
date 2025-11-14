# ConfíaTrade Frontend

Frontend construido con React + Vite + Tailwind CSS.

## Arquitectura

Organización por features:

```
features/         Módulos funcionales (empresas, participantes, etc.)
  └── empresas/
      ├── api/      Llamadas API específicas
      ├── components/ Componentes UI
      ├── hooks/    Custom hooks
      └── pages/    Páginas

shared/           Código compartido entre features
  ├── api/        Cliente HTTP
  ├── components/ Componentes reutilizables
  ├── types/      TypeScript types
  └── utils/      Utilidades

layout/           Layouts principales
```

## Setup

```bash
npm install
```

Crear archivo `.env`:

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Ejecutar

```bash
npm run dev
```

Disponible en: http://localhost:3000

## Principios

- Feature-based organization
- Separation of concerns
- Custom hooks para lógica
- Componentes puros
- Estado con Zustand + React Query
- Código limpio sin decoraciones
