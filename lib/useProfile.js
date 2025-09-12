'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'

export function useProfile() {
  const { user } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const supabase = useSupabase()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Error obteniendo perfil:', error)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user, supabase])

  return { profile, loading }
}
