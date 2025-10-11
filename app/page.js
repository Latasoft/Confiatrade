'use client';
  // Sin redirección automática por ahoraIN REDIRECCIÓN AUTOMÁTICA - Evitar buclest { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/useProfile';
import { useUserRole } from '@/lib/useUserRole';
import { SignedOut, SignedIn, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/ui/Footer';

export default function ClienteDashboard() {
  const { profile, loading } = useProfile();
  const { userProfile, isAdmin } = useUserRole();
  const router = useRouter();

  // Redirección INMEDIATA para admin
  if (userProfile?.rol === 'admin') {
    console.log('� ADMIN DETECTADO - REDIRIGIENDO INMEDIATAMENTE')
    window.location.replace('/admin')
    return null // No renderizar nada mientras redirecciona
  }

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
                {profile ? `¡Bienvenido, ${profile.nombre || 'Cliente'}!` : '¡Bienvenido a ConfiaTrade!'}
              </h1>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Sobre Nosotros Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="glass rounded-2xl animate-fadeIn mb-8">
            <div className="px-6 py-8 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                  Sobre ConfiaTrade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
                  Somos una plataforma especializada en comercio agrícola y logística, conectando productores, 
                  transportistas y compradores en un ecosistema confiable y eficiente.
                </p>
              </div>

              {/* Misión, Visión y Valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Misión</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Facilitar el comercio agrícola y la logística mediante una plataforma segura 
                    que conecte a todos los actores de la cadena de suministro.
                  </p>
                </div>

                <div className="glass rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">👁️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Visión</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Ser la plataforma de referencia para el comercio agrícola en América Latina, 
                    promoviendo la transparencia y eficiencia en cada transacción.
                  </p>
                </div>

                <div className="glass rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">⭐</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Valores</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Transparencia, confianza, innovación y compromiso con el desarrollo 
                    sostenible del sector agrícola.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Productos - Siempre visible pero con comportamiento diferente */}
            {profile ? (
              // Si está logueado, permite hacer clic
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
            ) : (
              // Si no está logueado, solo muestra información
              <div className="group cursor-not-allowed">
                <div className="glass rounded-xl opacity-60 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">📦</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                          Productos
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Inicia sesión para ver
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Solicitudes - Solo visible si está logueado */}
            {profile && (
              <Link href="/solicitudes" className="group">
                <div className="glass rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">�</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
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
            )}
          </div>
        </div>

        {/* Cómo Funciona Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="glass rounded-2xl animate-fadeIn mb-8">
            <div className="px-6 py-8 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                  ¿Cómo Funciona ConfiaTrade?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
                  Descubre cómo nuestra plataforma revoluciona el intercambio comercial, 
                  conectando productores, transportistas y compradores de manera eficiente y segura.
                </p>
              </div>

              {/* Proceso en 4 Pasos */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
                  Nuestro Proceso en 4 Simples Pasos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Paso 1 */}
                  <div className="glass rounded-xl p-6 text-center hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">📝</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">1. Registro</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Crea tu cuenta y verifica tu identidad para comenzar a comercializar.
                    </p>
                  </div>

                  {/* Paso 2 */}
                  <div className="glass rounded-xl p-6 text-center hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">🔍</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">2. Búsqueda</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Explora productos en tiempo real.
                    </p>
                  </div>

                  {/* Paso 3 */}
                  <div className="glass rounded-xl p-6 text-center hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">✅</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">3. Transacción</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Realiza transacciones seguras. 
                    </p>
                  </div>

                  {/* Paso 4 */}
                  <div className="glass rounded-xl p-6 text-center hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">🤝</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">4. Conexión</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Conéctate directamente con el vendedor para negociar sobre el transporte.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action - Condicional basado en autenticación */}
              <div className="mt-8">
                {profile ? (
                  // Usuario autenticado
                  <div className="glass rounded-xl p-8 text-center bg-gradient-to-r from-green-500/20 to-blue-500/20 dark:from-green-400/20 dark:to-blue-400/20">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">¡Comienza a Comercializar!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Tienes acceso completo a nuestra plataforma. Explora productos y gestiona tus solicitudes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/productos" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Ver Productos
                      </Link>
                      <Link href="/mis-solicitudes" className="glass text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/10 px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-300 dark:border-gray-600">
                        Mis Solicitudes
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Usuario no autenticado
                  <div className="glass rounded-xl p-8 text-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">¿Listo para Comenzar?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Únete a miles de empresarios que ya están revolucionando sus negocios con ConfiaTrade. 
                      Inicia sesión para acceder a todas las funcionalidades.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <SignInButton>
                        <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                          Iniciar Sesión
                        </button>
                      </SignInButton>      
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}