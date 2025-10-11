'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/useUserRole'
import { SignedOut, SignedIn } from '@clerk/nextjs'

// Componente para proteger rutas de admin
export function AdminProtectedRoute({ children }) {
  const { userProfile, loading, isAdmin } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userProfile && !isAdmin) {
      // No es admin, redirigir a página de cliente
      router.push('/cliente')
    }
  }, [loading, userProfile, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 dark:border-gray-700/30">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Acceso Restringido
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Debes iniciar sesión para acceder a esta área
            </p>
            <button 
              onClick={() => router.push('/sign-in')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {isAdmin ? children : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 dark:border-gray-700/30">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                🚫 Acceso Denegado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No tienes permisos de administrador para acceder a esta área
              </p>
              <button 
                onClick={() => router.push('/cliente')}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200"
              >
                Ir al Panel de Cliente
              </button>
            </div>
          </div>
        )}
      </SignedIn>
    </>
  )
}

// Componente para proteger rutas de cliente
export function ClienteProtectedRoute({ children }) {
  const { userProfile, loading, isCliente } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userProfile && !isCliente) {
      // No es cliente, redirigir a página de admin
      router.push('/admin')
    }
  }, [loading, userProfile, isCliente, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 dark:border-gray-700/30">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Acceso Restringido
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Debes iniciar sesión para acceder a esta área
            </p>
            <button 
              onClick={() => router.push('/sign-in')}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {isCliente ? children : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 dark:border-gray-700/30">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                🚫 Acceso Denegado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Esta área está restringida solo para clientes
              </p>
              <button 
                onClick={() => router.push('/admin')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Ir al Panel de Admin
              </button>
            </div>
          </div>
        )}
      </SignedIn>
    </>
  )
}