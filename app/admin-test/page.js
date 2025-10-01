'use client';

import Link from 'next/link';

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración - Modo Prueba</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-700">
            <strong>Nota:</strong> Esta es una página de prueba temporal para acceder a los módulos admin sin autenticación Clerk.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/usuarios" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Usuarios</h2>
                <p className="text-sm text-gray-500">Gestionar usuarios del sistema</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/productos" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Productos</h2>
                <p className="text-sm text-gray-500">Catálogo de productos</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/envios" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🚚</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Envíos</h2>
                <p className="text-sm text-gray-500">Seguimiento de envíos</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/pagos" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💳</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Pagos</h2>
                <p className="text-sm text-gray-500">Gestión de pagos</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/reportes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Reportes</h2>
                <p className="text-sm text-gray-500">Estadísticas y reportes</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/solicitudes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Solicitudes</h2>
                <p className="text-sm text-gray-500">Solicitudes de carga</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Estado de la Conexión</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm">Supabase: Configurado</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-sm">Clerk: No configurado (modo prueba)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}