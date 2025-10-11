import Navbar from '@/components/Navbar'
import { ThemeDemo } from '@/components/ThemeDemo'
import Link from 'next/link'

export default function TestThemePage() {
  return (
    <>
      <Navbar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
              🎨 Nuevo Sistema de Temas ConfiaTrade
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Prueba el cambio entre modo claro y oscuro con el botón en la esquina superior derecha
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {/* Tarjeta de demostración 1 */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                ✨ Características Implementadas
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Tema claro/oscuro automático</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Efectos glassmorphism elegantes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Fondo dinámico con animaciones</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Toggle disponible en todas las páginas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Colores mejorados sin amarillo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Transiciones suaves entre temas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta de navegación */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                🧭 Páginas Actualizadas
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/" className="glass rounded-xl p-4 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🏠</span>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Página Principal</span>
                  </div>
                </Link>
                <a href="/cliente" className="glass rounded-xl p-4 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">👤</span>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Panel Cliente</span>
                  </div>
                </a>
                <a href="/admin" className="glass rounded-xl p-4 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">⚙️</span>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Panel Admin</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Tarjeta de colores */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                🎨 Paleta de Colores
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Azul Principal</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Púrpura Acento</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verde Éxito</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gris Neutral</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}