'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'
import { TransferenciaComponent } from '@/components/ui/TransferenciaComponent'

export default function TransferenciaPage() {
  // Función personalizada para manejar el envío del comprobante
  const handleComprobanteSubmit = (file, setLoading) => {
    // Simular envío (aquí iría la lógica real de API)
    setTimeout(() => {
      setLoading(false)
      console.log('Archivo enviado desde página transferencia:', file.name)
      // Aquí iría la redirección cuando esté lista
    }, 2000)
  }

  return (
    <BackgroundWrapper>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Datos para Transferencia
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Realiza tu transferencia con los siguientes datos y sube el comprobante
              </p>
            </div>

            {/* Componente de transferencia */}
            <TransferenciaComponent 
              monto="$150.000"
              onSubmit={handleComprobanteSubmit}
            />
          </div>
        </main>
        <Footer />
      </div>
    </BackgroundWrapper>
  )
}