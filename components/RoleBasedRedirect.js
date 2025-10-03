'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/lib/useProfile'

export default function RoleBasedRedirect({ children }) {
  const { profile, loading, isAdmin, isClient } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile) {
      const currentPath = window.location.pathname
      
      // Si está en login o sign-up, redirigir según el rol
      if (currentPath === '/sign-in' || currentPath === '/sign-up') {
        if (isAdmin) {
          router.replace('/admin')
        } else if (isClient) {
          router.replace('/') // Redirigir clientes al dashboard principal
        }
      }
      
      // Si es admin intentando acceder a rutas de cliente
      if (isAdmin && currentPath.startsWith('/cliente')) {
        router.replace('/admin')
      }
      
      // Si es cliente intentando acceder a rutas de admin
      if (isClient && currentPath.startsWith('/admin')) {
        router.replace('/') // Redirigir clientes al dashboard principal
      }
    }
  }, [profile, loading, isAdmin, isClient, router])

  // Mostrar loading mientras se determina el rol
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return children
}