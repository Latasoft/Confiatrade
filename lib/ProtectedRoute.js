'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useProfile } from '@/lib/useProfile'

export default function ProtectedRoute({ children, role }) {
  const router = useRouter()
  const { user } = useUser()
  const { profile, loading } = useProfile()

  useEffect(() => {
    if (loading) return

    // 🔹 No logueado → fuera
    if (!user) {
      router.replace('/')
      return
    }

    // 🔹 Si hay perfil pero rol no coincide → redirigir
    if (profile && profile.rol !== role) {
      if (profile.rol === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/')
      }
    }
  }, [user, profile, loading, router, role])

  // Mientras carga, mostrar "cargando"
  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>
  }

  return <>{children}</>
}
