'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <Navbar />
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            ¿Cómo Funciona <span className="text-green-600">ConfiaTrade</span>?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo nuestra plataforma revoluciona el intercambio comercial en el corredor bioceánico, 
            conectando productores, transportistas y compradores de manera eficiente y segura.
          </p>
        </div>

        {/* Proceso Principal */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Nuestro Proceso en 4 Simples Pasos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Paso 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">1. Registro</h3>
              <p className="text-gray-600">
                Crea tu cuenta como productor, transportista o comprador. 
                Verifica tu identidad y completa tu perfil comercial.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">2. Búsqueda</h3>
              <p className="text-gray-600">
                Explora productos disponibles, servicios de transporte 
                o busca compradores para tus productos en tiempo real.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">3. Conexión</h3>
              <p className="text-gray-600">
                Conecta directamente con otros usuarios, negocia términos 
                y acuerda condiciones comerciales de forma transparente.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-white">✅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">4. Transacción</h3>
              <p className="text-gray-600">
                Realiza transacciones seguras con nuestro sistema de pagos 
                protegido y seguimiento en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Características Principales */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Características Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-8">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-green-800 mb-3">Seguridad Garantizada</h3>
              <p className="text-green-700">
                Sistema de verificación de usuarios y transacciones protegidas 
                con tecnología blockchain para máxima seguridad.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-blue-800 mb-3">Análisis en Tiempo Real</h3>
              <p className="text-blue-700">
                Reportes detallados, estadísticas de mercado y análisis 
                de tendencias para tomar decisiones informadas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-8">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-yellow-800 mb-3">Alcance Internacional</h3>
              <p className="text-yellow-700">
                Conecta con socios comerciales en Argentina, Chile, Brasil 
                y toda Sudamérica a través del corredor bioceánico.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Pagos Flexibles</h3>
              <p className="text-purple-700">
                Múltiples métodos de pago, financiamiento y opciones 
                de crédito comercial adaptadas a tu negocio.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-8">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-red-800 mb-3">Aplicación Móvil</h3>
              <p className="text-red-700">
                Gestiona tu negocio desde cualquier lugar con nuestra 
                aplicación móvil disponible para iOS y Android.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-indigo-800 mb-3">Matching Inteligente</h3>
              <p className="text-indigo-700">
                Algoritmos avanzados que conectan automáticamente 
                oferta y demanda según tus preferencias comerciales.
              </p>
            </div>
          </div>
        </div>

        {/* Beneficios por Tipo de Usuario */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Beneficios Según tu Perfil
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Productores */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
                <div className="text-4xl mb-2">🌾</div>
                <h3 className="text-2xl font-bold text-white">Productores</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Acceso directo a mercados internacionales
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Eliminación de intermediarios
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Mejores precios para tus productos
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Pagos seguros y puntuales
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Herramientas de gestión de inventario
                  </li>
                </ul>
              </div>
            </div>

            {/* Transportistas */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                <div className="text-4xl mb-2">🚛</div>
                <h3 className="text-2xl font-bold text-white">Transportistas</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    Optimización de rutas y cargas
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    Reducción de viajes vacíos
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    Pagos garantizados por servicio
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    Seguimiento GPS en tiempo real
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">✓</span>
                    Red ampliada de clientes
                  </li>
                </ul>
              </div>
            </div>

            {/* Compradores */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-center">
                <div className="text-4xl mb-2">🛒</div>
                <h3 className="text-2xl font-bold text-white">Compradores</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">✓</span>
                    Amplia variedad de productos
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">✓</span>
                    Precios competitivos directos
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">✓</span>
                    Certificación de calidad
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">✓</span>
                    Entregas puntuales y rastreables
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-2">✓</span>
                    Soporte comercial especializado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">¿Listo para Comenzar?</h2>
          <p className="text-xl mb-8">
            Únete a miles de empresarios que ya están revolucionando 
            sus negocios con ConfiaTrade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Registrarse Gratis
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-green-600 transition-colors">
              Ver Demo
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
