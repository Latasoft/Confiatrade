import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'

export default function ClienteTestPage() {
  return (
    <BackgroundWrapper>
      <div className="flex flex-col min-h-screen">
        <NavbarCliente />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="px-4 py-6 sm:px-0">
              <div className="glass rounded-2xl animate-fadeIn">
                <div className="px-6 py-8 sm:p-8">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
                    ¡Test Cliente!
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Esta es una página de prueba - ConfiaTrade
                  </p>
                  <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 sm:px-0">
              <div className="glass rounded-2xl p-8">
                <p className="text-gray-600 dark:text-gray-300">
                  Contenido de prueba para verificar que el footer aparezca correctamente.
                  Este contenido debería permitir que el footer se muestre en la parte inferior.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </BackgroundWrapper>
  )
}