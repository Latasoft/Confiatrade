# ConfiaTrade

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Instalación

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/Latasoft/Confiatrade.git
cd Confiatrade-1
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Crear archivo de variables de entorno
```bash
# Windows
New-Item .env.local -ItemType File

# Linux/Mac
touch .env.local
```

### Paso 4: Configurar variables de entorno
Contacta al administrador del proyecto para obtener las claves necesarias para el archivo `.env.local`.

## Desarrollo

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Tecnologías utilizadas

- Next.js 14
- Supabase (Base de datos)
- Clerk (Autenticación)
- Tailwind CSS
- React

## Estructura del proyecto

```
├── app/
│   ├── admin/          # Panel administrativo
│   ├── cliente/        # Panel cliente
│   ├── productos/      # Catálogo de productos
│   └── api/           # API routes
├── lib/               # Utilidades y configuración
└── components/        # Componentes reutilizables
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
