'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/lib/CartContext'
import RoleBasedRedirect from '@/components/RoleBasedRedirect'
import { ThemeProvider } from '@/components/theme-provider'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'
import '@/lib/devWarnings'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="es" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <CartProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster 
                position="top-right"
                toastOptions={{
                  className: 'glass',
                  style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'hsl(var(--foreground))',
                  },
                }}
              />
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

function LayoutWrapper({ children }) {
  const pathname = usePathname()
  
  // Páginas que tienen su propio BackgroundWrapper en su layout
  const isClientePage = pathname?.startsWith('/cliente')
  const isAdminPage = pathname?.startsWith('/admin')
  const isAuthPage = pathname?.startsWith('/sign-')
  
  if (isClientePage || isAdminPage || isAuthPage) {
    // Estas páginas manejan su propio fondo en sus layouts específicos
    return <>{children}</>
  }
  
  // Para la página de inicio y otras páginas públicas aplicamos BackgroundWrapper
  return (
    <BackgroundWrapper>
      {children}
    </BackgroundWrapper>
  )
}
