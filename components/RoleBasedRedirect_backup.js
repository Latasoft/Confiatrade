'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useUserRole } from '@/lib/useUserRole'
import { useUser } from '@clerk/nextjs'

export default function RoleBasedRedirect({ children }) {
  const { user, isLoaded } = useUser()
  const { userProfile, loading, isAdmin, isCliente } = useUserRole()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Solo hacer redirección automática en rutas específicas
    const autoRedirectRoutes = ['/', '/dashboard']
    
    if (!isLoaded || !loading || !user || !autoRedirectRoutes.includes(pathname)) {
      return
    }

    if (userProfile) {
      console.log('🔄 Redirección automática desde:', pathname)
      console.log('� Usuario:', userProfile.nombre, '- Rol:', userProfile.rol)
      
      if (isAdmin) {
        console.log('� Redirigiendo admin a /admin')
        router.push('/admin')
      } else if (isCliente) {
        console.log('� Redirigiendo cliente a /cliente')  
        router.push('/cliente')
      }
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