'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProtectedRoute({ children, role }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return

      if (!user) {
        router.push('/sign-in')
        return
      }

      try {
        const userEmail = user.emailAddresses[0]?.emailAddress
        console.log('🔍 Verificando acceso para:', userEmail)

        const { data: userData, error } = await supabase
          .from('usuarios_roles')
          .select('rol, nombre, activo')
          .eq('email', userEmail)
          .single()

        if (error || !userData) {
          console.log('Usuario no encontrado en BD, creando registro...')
          // Si el usuario no existe en la BD, crearlo como cliente
          const { data: newUser, error: createError } = await supabase
            .from('usuarios_roles')
            .insert([{
              clerk_id: user.id,
              email: userEmail,
              nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
              rol: 'cliente',
              activo: true
            }])
            .select()
            .single()

          if (createError) {
            console.error('Error creando usuario:', createError)
            router.push('/cliente')
            return
          }

          // Usuario recién creado es cliente
          if (role === 'admin') {
            router.push('/cliente')
            return
          }
          
          setIsAuthorized(true)
          setIsChecking(false)
          return
        }

        // Usuario existe en la BD - verificar permisos
        const isAdmin = userData.rol === 'admin'
        const isActive = userData.activo === true

        console.log('👤 Usuario:', userData.nombre)
        console.log('👑 Es admin?', isAdmin)
        console.log('✅ Está activo?', isActive)

        if (!isActive) {
          console.log('❌ Usuario inactivo')
          router.push('/acceso-denegado')
          return
        }

        // Verificar acceso según el rol requerido
        if (role === 'admin' && !isAdmin) {
          console.log('❌ Acceso denegado a admin - redirigiendo a cliente')
          router.push('/cliente')
          return
        }

        if (role === 'cliente' && isAdmin) {
          console.log('🔄 Es admin - redirigiendo a panel admin')
          router.push('/admin')
          return
        }

        console.log('✅ Acceso autorizado!')
        setIsAuthorized(true)

      } catch (error) {
        console.error('Error verificando acceso:', error)
        router.push('/cliente')
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [user, isLoaded, router, role])

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
