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
                  style: {
                    background: 'white',
                    color: '#333',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                  success: {
                    style: {
                      background: 'white',
                      color: '#059669',
                      border: '1px solid #10b981',
                    },
                    iconTheme: {
                      primary: '#10b981',
                      secondary: 'white',
                    },
                  },
                  error: {
                    style: {
                      background: 'white',
                      color: '#dc2626',
                      border: '1px solid #ef4444',
                    },
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: 'white',
                    },
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
