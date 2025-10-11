'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useUserRole } from '@/lib/useUserRole'
import { supabase } from '@/lib/supabaseClient'

export default function SystemTestPage() {
  const { user, isLoaded } = useUser()
  const { userProfile, loading, error, isAdmin, isCliente } = useUserRole()
  const [diagnostics, setDiagnostics] = useState({})
  const [apiTests, setApiTests] = useState({})

  useEffect(() => {
    runDiagnostics()
  }, [user, isLoaded])

  const runDiagnostics = async () => {
    const results = {}

    // Test 1: Clerk Status
    results.clerkLoaded = isLoaded
    results.clerkUser = !!user
    results.clerkEmail = user?.emailAddresses[0]?.emailAddress || null

    // Test 2: User Profile
    results.profileLoaded = !loading
    results.profileExists = !!userProfile
    results.profileRole = userProfile?.rol || null
    results.profileError = error

    // Test 3: Role Detection
    results.isAdminDetected = isAdmin
    results.isClienteDetected = isCliente

    // Test 4: Database Connection
    try {
      const { data, error } = await supabase
        .from('usuarios_roles')
        .select('count', { count: 'exact', head: true })

      results.supabaseConnection = !error
      results.supabaseError = error?.message || null
      results.usersCount = data?.count || 0
    } catch (err) {
      results.supabaseConnection = false
      results.supabaseError = err.message
    }

    setDiagnostics(results)
  }

  const testAPI = async (endpoint) => {
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      return {
        success: response.ok,
        status: response.status,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message
      }
    }
  }

  const runAPITests = async () => {
    const endpoints = [
      '/api/verify-supabase',
      '/api/test-supabase-connection'
    ]

    const results = {}
    for (const endpoint of endpoints) {
      results[endpoint] = await testAPI(endpoint)
    }
    setApiTests(results)
  }

  const StatusIcon = ({ status }) => (
    <span className={`text-2xl ${status ? 'text-green-400' : 'text-red-400'}`}>
      {status ? '✅' : '❌'}
    </span>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Test del Sistema - Confiatrade
          </h1>
          <p className="text-white/80">
            Verificación completa del estado del sistema de autenticación y base de datos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clerk Authentication */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🔐 Autenticación Clerk
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Clerk Cargado:</span>
                <StatusIcon status={diagnostics.clerkLoaded} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Usuario Logueado:</span>
                <StatusIcon status={diagnostics.clerkUser} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Email:</span>
                <span className="text-white text-sm">
                  {diagnostics.clerkEmail || 'No detectado'}
                </span>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              👤 Perfil de Usuario
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Perfil Cargado:</span>
                <StatusIcon status={diagnostics.profileLoaded} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Perfil Existe:</span>
                <StatusIcon status={diagnostics.profileExists} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Rol Detectado:</span>
                <span className="text-white text-sm">
                  {diagnostics.profileRole || 'No detectado'}
                </span>
              </div>
              {diagnostics.profileError && (
                <div className="text-red-300 text-sm">
                  Error: {diagnostics.profileError}
                </div>
              )}
            </div>
          </div>

          {/* Role Detection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              👑 Detección de Roles
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Es Admin:</span>
                <StatusIcon status={diagnostics.isAdminDetected} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Es Cliente:</span>
                <StatusIcon status={diagnostics.isClienteDetected} />
              </div>
            </div>
          </div>

          {/* Database Connection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🗄️ Base de Datos
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Conexión Supabase:</span>
                <StatusIcon status={diagnostics.supabaseConnection} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Usuarios Registrados:</span>
                <span className="text-white text-sm">
                  {diagnostics.usersCount || 0}
                </span>
              </div>
              {diagnostics.supabaseError && (
                <div className="text-red-300 text-sm">
                  Error: {diagnostics.supabaseError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Tests */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🔌 Pruebas de API
          </h2>
          
          <button
            onClick={runAPITests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-4 transition-colors"
          >
            🧪 Ejecutar Pruebas de API
          </button>

          <div className="space-y-3">
            {Object.entries(apiTests).map(([endpoint, result]) => (
              <div key={endpoint} className="border border-white/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 font-medium">{endpoint}</span>
                  <StatusIcon status={result.success} />
                </div>
                <div className="text-sm text-white/60">
                  Status: {result.status} | 
                  {result.success ? 
                    ` ${result.data?.message || 'Success'}` : 
                    ` Error: ${result.error || result.data?.error}`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">🔧 Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={runDiagnostics}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Reejecutar Diagnóstico
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🏠 Ir a Inicio
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              👑 Ir a Admin
            </button>
          </div>
        </div>

        {/* User Profile Debug */}
        {userProfile && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🔍 Debug - Perfil Usuario</h2>
            <pre className="text-white/80 text-sm bg-black/20 p-4 rounded-lg overflow-auto">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">📋 Instrucciones de Test</h2>
          <div className="text-white/80 space-y-2">
            <p><strong>1. Test sin autenticación:</strong> Verifica que puedas ver esta página sin errores</p>
            <p><strong>2. Test con cliente:</strong> Inicia sesión como cliente y verifica redirección</p>
            <p><strong>3. Test con admin:</strong> Inicia sesión como admin y verifica acceso al panel</p>
            <p><strong>4. Test de API:</strong> Haz clic en "Ejecutar Pruebas de API" para verificar conectividad</p>
            <p><strong>Credenciales:</strong> admin@confiatrade.com / cliente@confiatrade.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}