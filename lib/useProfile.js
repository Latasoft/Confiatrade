'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function useProfile() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // Crear perfil desde datos de Clerk
        const userProfile = {
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
          rol: user.publicMetadata?.role || 'cliente',
          activo: true
        }
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }
  }, [user, isLoaded])

  // Funciones auxiliares para determinar roles
  const isAdmin = profile?.rol === 'admin'
  const isClient = profile?.rol === 'cliente' || !profile?.rol

  return {
    profile,
    loading,
    error,
    isAdmin,
    isClient
  }
}
