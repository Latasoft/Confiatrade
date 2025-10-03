'use client';

import { useProfile } from '@/lib/useProfile';
import Link from 'next/link';
import NavbarCliente from '@/components/ui/NavbarCliente';

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
    <div className="min-h-screen bg-gray-50">
      <NavbarCliente />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Bienvenido, {profile?.nombre || 'Cliente'}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Panel de cliente - ConfiaTrade
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Productos */}
            <Link href="/productos" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                        Productos
                      </h3>
                      <p className="text-sm text-gray-500">
                        Explora nuestro catálogo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Transportes */}
            <Link href="/transportes" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">🚚</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                        Transportes
                      </h3>
                      <p className="text-sm text-gray-500">
                        Servicios de transporte
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Mis Productos */}
            <Link href="/mis-productos" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">📋</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
                        Mis Productos
                      </h3>
                      <p className="text-sm text-gray-500">
                        Gestiona tus productos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Reservas */}
            <Link href="/cliente/reservas" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600">
                        Mis Reservas
                      </h3>
                      <p className="text-sm text-gray-500">
                        Historial de reservas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Mis Pedidos */}
            <Link href="/cliente/mis-pedidos" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-pink-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-pink-600">
                        Mis Pedidos
                      </h3>
                      <p className="text-sm text-gray-500">
                        Historial de pedidos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Perfil */}
            <Link href="/cliente/perfil" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">👤</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                        Mi Perfil
                      </h3>
                      <p className="text-sm text-gray-500">
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
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actividad Reciente
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  No hay actividad reciente para mostrar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}