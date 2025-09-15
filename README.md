This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


## Paso 1. Una vez esté clonado el github https://github.com/Latasoft/Confiatrade.git , ejecutar el siguiente comando en la terminal: 
npm install
## Paso 2. Ejecutar el siguiente comando en la terminal:
New-Item .env.local -ItemType File
## Paso 3: Copiar en .env.local
NEXT_PUBLIC_SUPABASE_URL=https://mbbernznprzbrwjkbybs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVybnpucHJ6YnJ3amtieWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzg1NTIsImV4cCI6MjA3MjA1NDU1Mn0.Bzn4lZMk6zcf9Hcm1mvtyuyNH_5G1nCK7Z21vuibtVI


NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3RlcmxpbmctYm9iY2F0LTE5LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_dezT5hXuuBDNhEYlxGLBZB9LrZavI5VWEFnmwumfFN

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYmVybnpucHJ6YnJ3amtieWJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3ODU1MiwiZXhwIjoyMDcyMDU0NTUyfQ.nBifp5cb0rFGCJpNMpsVxUS62RM3MfBvr5TU7h0cVBs





# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=TU_CLERK_PUBLIC_KEY
CLERK_SECRET_KEY=TU_CLERK_SECRET_KEY

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
