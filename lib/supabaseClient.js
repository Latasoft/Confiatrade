
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables estén configuradas (warning en lugar de error)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables de entorno de Supabase no configuradas:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
}

// Cliente básico para uso anónimo con configuración mejorada
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false // Para uso en servidor
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
}) : null

// Hook personalizado para uso autenticado con Clerk
export function useSupabase() {
  const { getToken } = useAuth()
  
  const supabaseClient = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase no configurado correctamente')
      return null
    }
    
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
  
  return supabaseClient
}

// Helper para obtener el cliente apropiado
export function getSupabaseClient(useAuth = false) {
  if (useAuth) {
    // Para uso autenticado, devolver null y requerir el uso del hook directamente
    console.warn('Para autenticación, usar useSupabase() hook directamente en componentes')
    return null
  }
  return supabase
}
