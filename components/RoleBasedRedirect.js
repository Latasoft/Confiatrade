'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RoleBasedRedirect({ children }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [hasInitialRedirect, setHasInitialRedirect] = useState(false)

  useEffect(() => {
    // Solo hacer redirección automática en estas rutas específicas
    const autoRedirectRoutes = ['/', '/dashboard']
    
    if (!isLoaded || !user || !autoRedirectRoutes.includes(pathname)) {
      return
    }

    // Evitar múltiples redirecciones
    if (hasInitialRedirect) {
      return
    }

    const redirectUser = async () => {
      try {
        const userEmail = user.emailAddresses[0]?.emailAddress
        console.log('🔄 Redirección automática desde:', pathname)
        console.log('🔍 Buscando usuario con email:', userEmail)
        console.log('🔍 Clerk ID real:', user.id)
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('rol, role, is_admin, estado, clerk_id')
          .eq('email', userEmail)
          .single()

        console.log('📊 Datos COMPLETOS encontrados en BD:', JSON.stringify(userData, null, 2))
        console.log('🔍 Tipo de userData.rol:', typeof userData?.rol, '- Valor:', userData?.rol)
        console.log('🔍 Tipo de userData.role:', typeof userData?.role, '- Valor:', userData?.role)
        console.log('🔍 Tipo de userData.is_admin:', typeof userData?.is_admin, '- Valor:', userData?.is_admin)
        
        if (userData) {
          console.log('🔑 Clerk ID en BD:', userData.clerk_id)
          console.log('🔑 ¿Coinciden los IDs?', userData.clerk_id === user.id)
        }

        if (error || !userData) {
          // Usuario no existe, crear como cliente
          console.log('👤 Usuario no encontrado, creando como cliente')
          await supabase.from('users').insert([{
            email: userEmail,
            nombre: user.firstName || 'Usuario',
            rol: 'cliente',
            role: 'cliente',
            is_admin: false,
            estado: 'activo',
            clerk_id: user.id
          }])
          router.push('/cliente')
          setHasInitialRedirect(true)
          return
        }

        // Verificar si es admin con debugging detallado
        console.log('🔍 Verificando condiciones de admin:')
        console.log('  userData.rol === "admin":', userData.rol === 'admin')
        console.log('  userData.rol === "Administrador":', userData.rol === 'Administrador')
        console.log('  userData.role === "admin":', userData.role === 'admin')
        console.log('  userData.is_admin === "true":', userData.is_admin === 'true')
        console.log('  userData.is_admin === true:', userData.is_admin === true)
        
        const isAdmin = 
          userData.rol === 'admin' || 
          userData.rol === 'Administrador' ||
          userData.role === 'admin' || 
          userData.is_admin === 'true' ||
          userData.is_admin === true

        console.log('🎭 Resultado final - Es admin?', isAdmin)
        console.log('🔐 Estado:', userData.estado)

        // Redirigir según el rol SOLO desde rutas de entrada
        if (isAdmin && userData.estado === 'activo') {
          console.log('🚀 Redirección inicial: admin → /admin')
          router.push('/admin')
        } else {
          console.log('🚀 Redirección inicial: cliente → /cliente')
          router.push('/cliente')
        }
        
        setHasInitialRedirect(true)

      } catch (error) {
        console.error('Error en redirección:', error)
        router.push('/cliente')
        setHasInitialRedirect(true)
      }
    }

    redirectUser()
  }, [user, isLoaded, router, pathname, hasInitialRedirect])

  return <>{children}</>
}