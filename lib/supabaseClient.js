
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'

// Cliente básico para uso anónimo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hook personalizado para uso autenticado con Clerk
export function useSupabase() {
  const { getToken } = useAuth()
  
  const supabase = useMemo(() => {
    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          fetch: async (url, options = {}) => {
            try {
              const token = await getToken({ template: 'supabase' })
              return fetch(url, {
                ...options,
                headers: {
                  ...options.headers,
                  Authorization: token ? `Bearer ${token}` : undefined,
                },
              })
            } catch (error) {
              console.error('Error al obtener el token de Clerk:', error)
              return fetch(url, options)
            }
          },
        },
      }
    )
  }, [getToken])
  
  return supabase
}

// Helper para obtener el cliente apropiado
export function getSupabaseClient(useAuth = false) {
  if (useAuth) {
    return useSupabase()
  }
  return supabase
}
