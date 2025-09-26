'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'

export function useProfile() {
  const { user } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Intentar obtener el perfil desde Supabase
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single()

        if (existingProfile) {
          setProfile(existingProfile)
        } else if (fetchError?.code === 'PGRST116') {
          // Usuario no existe en Supabase, crear uno nuevo
          const newProfile = {
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            nombre: user.firstName || '',
            apellido: user.lastName || '',
            rol: user.publicMetadata?.role || 'cliente',
            estado: 'activo'
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single()

          if (createError) throw createError
          setProfile(createdProfile)
        } else {
          throw fetchError
        }
      } catch (err) {
        console.error('Error al obtener perfil:', err)
        setError(err)
        // Si falla la conexión a Supabase, usar datos de Clerk
        setProfile({
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          nombre: user.firstName || '',
          apellido: user.lastName || '',
          rol: user.publicMetadata?.role || 'cliente',
          estado: 'activo'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const isAdmin = profile?.rol === 'admin'
  const isClient = profile?.rol === 'cliente'

  return {
    profile,
    loading,
    error,
    isAdmin,
    isClient,
    user
  }
}
