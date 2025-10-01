'use client'

import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const codigo = searchParams.get('codigo')
  const ordenId = searchParams.get('orden')

  const getErrorMessage = (errorType, codigo) => {
    switch (errorType) {
      case 'token_missing':
        return 'No se recibió la información de pago desde Webpay'
      case 'orden_no_encontrada':
        return 'No se pudo encontrar la información de tu orden'
      case 'procesamiento':
        return 'Hubo un error al procesar la respuesta de Webpay'
      default:
        if (codigo) {
          switch (codigo) {
            case '-1':
              return 'Transacción rechazada por el banco'
            case '-2':
              return 'Transacción abandonada por el usuario'
            case '-3':
              return 'Error en la transacción'
            case '-4':
              return 'Transacción rechazada por validación'
            case '-5':
              return 'Transacción rechazada por tarjeta inválida'
            case '-6':
              return 'Error interno del sistema de pagos'
            case '-7':
              return 'Orden ya fue procesada'
            case '-8':
              return 'Transacción rechazada por monto'
            default:
              return `Error de pago con código: ${codigo}`
          }
        }
        return 'Ocurrió un error durante el proceso de pago'
    }
  }

  const errorMessage = getErrorMessage(error, codigo)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header de error */}
            <div className="mb-8">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Error en el Pago
              </h1>
              <p className="text-gray-600">
                No se pudo completar tu transacción
              </p>
            </div>

            {/* Información del error */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  ¿Qué pasó?
                </h2>
                <p className="text-red-700">
                  {errorMessage}
                </p>
              </div>

              {ordenId && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Número de orden afectada
                  </label>
                  <p className="text-lg font-semibold">#{ordenId}</p>
                </div>
              )}

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Posibles causas:</strong></p>
                <ul className="list-disc list-inside text-left space-y-1">
                  <li>Fondos insuficientes en la tarjeta</li>
                  <li>Tarjeta vencida o bloqueada</li>
                  <li>Datos incorrectos de la tarjeta</li>
                  <li>Límite de compras excedido</li>
                  <li>Problemas de conexión durante el pago</li>
                  <li>Cancelación voluntaria del proceso</li>
                </ul>
              </div>
            </div>

            {/* Acciones recomendadas */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">¿Qué puedes hacer?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">1. Intentar nuevamente</h4>
                  <p className="text-blue-700">
                    Verifica los datos de tu tarjeta y vuelve a intentar el pago
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">2. Usar otra tarjeta</h4>
                  <p className="text-green-700">
                    Prueba con una tarjeta diferente si tienes disponible
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">3. Contactar tu banco</h4>
                  <p className="text-yellow-700">
                    Verifica que no haya restricciones en tu tarjeta
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">4. Contactar soporte</h4>
                  <p className="text-purple-700">
                    Si el problema persiste, contáctanos para ayudarte
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 mb-4">
                  <strong>¿Necesitas ayuda?</strong><br />
                  Nuestro equipo de soporte está disponible para asistirte
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/productos"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Volver a Productos
                  </a>
                  <a
                    href="/checkout"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Intentar Nuevamente
                  </a>
                  <a
                    href="mailto:soporte@confiatrade.com"
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    Contactar Soporte
                  </a>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-8 text-xs text-gray-500">
              <p>
                Si este error persiste, por favor copia el código de error y contáctanos:<br />
                <code className="bg-gray-100 px-2 py-1 rounded">
                  Error: {error || 'unknown'} | Código: {codigo || 'N/A'} | Orden: {ordenId || 'N/A'}
                </code>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}