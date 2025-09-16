'use client'

import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
