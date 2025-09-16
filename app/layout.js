'use client'

import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <LayoutWrapper>{children}</LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  )
}

function LayoutWrapper({ children }) {
  const pathname = usePathname()
  
  // Páginas que NO deben tener Navbar/Footer automático (ya tienen su propio layout)
  const isClientePage = pathname?.startsWith('/cliente')
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isClientePage || isAdminPage) {
    return <>{children}</>
  }
  
  // Páginas que SÍ deben tener Navbar/Footer automático
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  )
}
