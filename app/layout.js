'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { usePathname } from 'next/navigation'
import RoleBasedRedirect from '@/components/RoleBasedRedirect'
import { CartProvider } from '@/lib/CartContext'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <CartProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster position="top-right" />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

function LayoutWrapper({ children }) {
  const pathname = usePathname()
  
  // Páginas que NO deben tener Navbar/Footer automático (ya tienen su propio layout)
  const isAdminPage = pathname?.startsWith('/admin')
  const isTestPage = pathname?.startsWith('/test') || pathname?.startsWith('/diagnostic') || pathname?.startsWith('/admin-test')
  
  if (isAdminPage || isTestPage) {
    return <>{children}</>
  }
  
  // Páginas que SÍ deben tener Navbar/Footer automático
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  )
}
