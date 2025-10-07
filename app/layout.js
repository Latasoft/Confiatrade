'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/lib/CartContext'
import RoleBasedRedirect from '@/components/RoleBasedRedirect'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <CartProvider>
            <RoleBasedRedirect>
              <LayoutWrapper>{children}</LayoutWrapper>
            </RoleBasedRedirect>
            <Toaster position="top-right" />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

function LayoutWrapper({ children }) {
  const pathname = usePathname()
  
  // Páginas que NO deben tener layout automático
  const isClientePage = pathname?.startsWith('/cliente')
  const isAdminPage = pathname?.startsWith('/admin')
  const isAuthPage = pathname?.startsWith('/sign-')
  const isTestPage = pathname?.startsWith('/test') || pathname?.startsWith('/setup')
  
  if (isClientePage || isAdminPage || isAuthPage || isTestPage) {
    return <>{children}</>
  }
  
  // Para la página de inicio y otras páginas públicas
  return <>{children}</>
}
