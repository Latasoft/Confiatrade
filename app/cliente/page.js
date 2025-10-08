'use client';

import { useProfile } from '@/lib/useProfile';
import Link from 'next/link';

export default function ClienteDashboard() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="glass rounded-2xl animate-fadeIn">
            <div className="px-6 py-8 sm:p-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
                ¡Bienvenido, {profile?.nombre || 'Cliente'}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Panel de cliente - ConfiaTrade
              </p>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Productos */}
            <Link href="/cliente/productos" className="group">
              <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Productos
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Explora nuestro catálogo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Transportes */}
            <Link href="/cliente/transportes" className="group">
              <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">🚚</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        Transportes
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Servicios de transporte
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Reservas */}
            <Link href="/cliente/reservas" className="group">
              <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">📋</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Mis Reservas
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Gestiona tus reservas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Mis Pedidos */}
            <Link href="/cliente/mis-pedidos" className="group">
              <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        Mis Pedidos
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Historial de pedidos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Experiencias */}
            <Link href="/cliente/experiencias" className="group">
              <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        Experiencias
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Comparte tu experiencia
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Perfil */}
            <Link href="/cliente/perfil" className="group">
              <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">👤</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                        Mi Perfil
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Configuración de cuenta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 py-6 sm:px-0">
          <div className="glass rounded-2xl">
            <div className="px-6 py-8 sm:p-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">
                Actividad Reciente
              </h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  No hay actividad reciente para mostrar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}