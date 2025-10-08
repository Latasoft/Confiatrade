'use client';

import { useProfile } from '@/lib/useProfile';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/ui/Footer';

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
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
            <Link href="/productos" className="group">
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

            {/* Solicitudes */}
            <Link href="/productos" className="group">
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
                        Solicitudes
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Mis Solicitudes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}