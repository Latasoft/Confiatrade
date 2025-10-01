'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { utilidadesService } from '@/lib/webpayServices'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const ordenId = searchParams.get('orden')
  const token = searchParams.get('token')
  
  const [orden, setOrden] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (ordenId) {
      fetchOrden()
    } else {
      setError('No se encontró información de la orden')
      setLoading(false)
    }
  }, [ordenId])

  const fetchOrden = async () => {
    try {
      const response = await fetch(`/api/webpay/orden/${ordenId}`)
      if (!response.ok) {
        throw new Error('Error al cargar información de la orden')
      }
      const data = await response.json()
      setOrden(data)
    } catch (err) {
      console.error('Error al cargar orden:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del pago...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Error al cargar la información
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'No se pudo cargar la información de la orden'}
            </p>
            <a
              href="/productos"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Volver a Productos
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const pagoExitoso = orden.orden.estado === 'pagado'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header de confirmación */}
            <div className="text-center mb-8">
              <div className={`text-6xl mb-4 ${pagoExitoso ? 'text-green-500' : 'text-red-500'}`}>
                {pagoExitoso ? '✅' : '❌'}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {pagoExitoso ? '¡Pago Exitoso!' : 'Pago Rechazado'}
              </h1>
              <p className="text-gray-600">
                {pagoExitoso 
                  ? 'Tu pago ha sido procesado correctamente'
                  : 'Hubo un problema al procesar tu pago'
                }
              </p>
            </div>

            {/* Información de la orden */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Información de la Orden</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Número de Orden</label>
                  <p className="text-lg font-semibold">#{orden.orden.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estado</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    pagoExitoso 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {orden.orden.estado.charAt(0).toUpperCase() + orden.orden.estado.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p>{orden.orden.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha</label>
                  <p>{utilidadesService.formatearFecha(orden.orden.fecha_creacion)}</p>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Productos Comprados</h3>
                <div className="space-y-2">
                  {orden.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.nombre_producto}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {utilidadesService.formatearPrecio(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Pagado:</span>
                  <span className="text-green-600">
                    {utilidadesService.formatearPrecio(orden.orden.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de la transacción (solo si hay transacciones) */}
            {orden.transacciones && orden.transacciones.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-semibold mb-3">Información de la Transacción</h3>
                {orden.transacciones.map((transaccion) => (
                  <div key={transaccion.id} className="space-y-2">
                    {transaccion.codigo_autorizacion && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Código de Autorización:</span>
                        <span className="font-medium">{transaccion.codigo_autorizacion}</span>
                      </div>
                    )}
                    {transaccion.ultimos_digitos && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tarjeta terminada en:</span>
                        <span className="font-medium">****{transaccion.ultimos_digitos}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha de transacción:</span>
                      <span className="font-medium">
                        {utilidadesService.formatearFecha(transaccion.fecha_transaccion)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones */}
            <div className="text-center space-y-4">
              {pagoExitoso ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      <strong>¡Gracias por tu compra!</strong><br />
                      Recibirás un email de confirmación en {orden.orden.email}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => window.print()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Imprimir Comprobante
                    </button>
                    <a
                      href="/productos"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      Seguir Comprando
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">
                      Tu pago no pudo ser procesado. Puedes intentar nuevamente o contactar con soporte.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/productos"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      Intentar Nuevamente
                    </a>
                    <a
                      href="/contacto"
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                    >
                      Contactar Soporte
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}