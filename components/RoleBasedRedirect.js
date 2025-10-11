'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useUserRole } from '@/lib/useUserRole'
import { useUser } from '@clerk/nextjs'

export default function RoleBasedRedirect({ children }) {
  // Componente desactivado temporalmente para evitar conflictos
  // La redirección se maneja en page.js directamente

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return children
}