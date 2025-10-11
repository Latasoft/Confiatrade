'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'

export function useUserRole() {
  const { user, isLoaded } = useUser()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoaded && user) {
      loadUserProfile()
    } else if (isLoaded && !user) {
      setUserProfile(null)
      setLoading(false)
    }
  }, [user, isLoaded])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar usuario en la base de datos
      const { data: existingUser, error: fetchError } = await supabase
        .from('usuarios_roles')
        .select('id, clerk_id, email, nombre, rol, activo, created_at, updated_at')
        .eq('clerk_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingUser) {
        // Usuario ya existe en la BD
        setUserProfile(existingUser)
      } else {
        // Usuario no existe, determinar rol basado en email
        const email = user.emailAddresses[0]?.emailAddress || ''
        const rol = determinarRolPorEmail(email)

        // Crear nuevo usuario en la BD
        const nuevoUsuario = {
          clerk_id: user.id,
          email: email,
          nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
          rol: rol,
          activo: true
        }

        const { data: newUser, error: insertError } = await supabase
          .from('usuarios_roles')
          .insert([nuevoUsuario])
          .select()
          .single()

        if (insertError) throw insertError

        setUserProfile(newUser)
        console.log('✅ Nuevo usuario creado:', newUser)
      }

    } catch (error) {
      console.error('❌ Error cargando perfil:', error)
      setError(error.message)
      // En caso de error, crear perfil básico desde Clerk
      const email = user.emailAddresses[0]?.emailAddress || ''
      setUserProfile({
        clerk_id: user.id,
        email: email,
        nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
        rol: determinarRolPorEmail(email), // Determinar rol basado en email
        activo: true
      })
    } finally {
      setLoading(false)
    }
  }

  const determinarRolPorEmail = (email) => {
    // Emails específicos para admin
    const adminEmails = [
      'admin@confiatrade.com',
      'administrador@confiatrade.com',
      'diego@confiatrade.com', // Ejemplo
      // 'tu-email@gmail.com' // ← Agrega aquí tu email para ser admin
    ]

    const esAdmin = adminEmails.includes(email.toLowerCase())
    console.log('🔍 Determinando rol para:', email, '→', esAdmin ? 'admin' : 'cliente')
    return esAdmin ? 'admin' : 'cliente'
  }

  const isAdmin = () => {
    return userProfile?.rol === 'admin'
  }

  const isCliente = () => {
    return userProfile?.rol === 'cliente'
  }

  const updateUserRole = async (newRole) => {
    if (!userProfile) return false

    try {
      const { data, error } = await supabase
        .from('usuarios_roles')
        .update({ rol: newRole })
        .eq('clerk_id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserProfile(data)
      return true
    } catch (error) {
      console.error('Error actualizando rol:', error)
      return false
    }
  }

  return {
    user,
    userProfile,
    loading,
    error,
    isAdmin: isAdmin(),
    isCliente: isCliente(),
    updateUserRole,
    refetch: loadUserProfile
  }
}