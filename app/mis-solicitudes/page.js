'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'
import { TransferenciaComponent } from '@/components/ui/TransferenciaComponent'
import { Package, Clock, CheckCircle, XCircle, CreditCard, FileText } from 'lucide-react'

export default function MisSolicitudesPage() {
  const { user } = useUser()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalPago, setModalPago] = useState(false)
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)

  // Cargar solicitudes del cliente
  useEffect(() => {
    if (user) {
      cargarMisSolicitudes()
    }
  }, [user])

  const cargarMisSolicitudes = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🔍 Cargando solicitudes para usuario:', user.id)
      
      const { data, error } = await supabase
        .from('solicitudes_compra')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('📋 Solicitudes encontradas:', data)
      setSolicitudes(data || [])

      if (data && data.length === 0) {
        toast('No tienes solicitudes aún', {
          icon: 'ℹ️',
          style: {
            background: '#e3f2fd',
            color: '#1976d2',
          },
        })
      }
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error)
      setError(error.message)
      toast.error('Error al cargar tus solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalPago = (solicitud) => {
    setSolicitudSeleccionada(solicitud)
    setModalPago(true)
  }

  const cerrarModalPago = () => {
    setModalPago(false)
    setSolicitudSeleccionada(null)
  }

  const manejarEnvioComprobante = async (archivo, setLoadingComprobante) => {
    try {
      console.log('📤 Iniciando subida de comprobante:', archivo.name)
      
      // 1. Convertir archivo a base64 para guardarlo en la BD
      const convertirABase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result)
          reader.onerror = error => reject(error)
        })
      }

      const archivoBase64 = await convertirABase64(archivo)
      console.log('✅ Archivo convertido a base64')

      // 2. Actualizar la base de datos con toda la información
      const { error } = await supabase
        .from('solicitudes_compra')
        .update({ 
          estado_pago: 'comprobante_enviado',
          mensaje: `Comprobante: ${archivo.name} (${(archivo.size / 1024).toFixed(1)}KB) - Subido: ${new Date().toLocaleString()}`,
          comprobante_data: archivoBase64,
          comprobante_url: archivo.name // Guardamos el nombre como referencia
        })
        .eq('id', solicitudSeleccionada.id)

      if (error) throw error

      console.log('✅ Comprobante guardado exitosamente en la base de datos')
      setLoadingComprobante(false)
      toast.success('📄 Comprobante enviado y guardado correctamente. El admin podrá verlo para revisar tu pago.')
      cerrarModalPago()
      cargarMisSolicitudes() // Recargar las solicitudes
    } catch (error) {
      console.error('Error al enviar comprobante:', error)
      setLoadingComprobante(false)
      toast.error('Error al enviar el comprobante')
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500'
      case 'aprobada': return 'bg-green-500' 
      case 'rechazada': return 'bg-red-500'
      case 'mas_info': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getEstadoProductoColor = (estadoProducto) => {
    switch (estadoProducto) {
      case 'finalizada': return 'bg-indigo-500'
      case 'en_proceso': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case 'pendiente': return <Clock className="h-4 w-4" />
      case 'aprobada': return <CheckCircle className="h-4 w-4" />
      case 'rechazada': return <XCircle className="h-4 w-4" />
      case 'mas_info': return <FileText className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getEstadoProductoIcono = (estadoProducto) => {
    switch (estadoProducto) {
      case 'finalizada': return <Package className="h-4 w-4" />
      case 'en_proceso': return <Clock className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible'
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Cargando mis solicitudes...</p>
            </div>
          </div>
          <Footer />
        </div>
      </BackgroundWrapper>
    )
  }

  return (
    <BackgroundWrapper>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Header con glass effect */}
            <div className="glass rounded-2xl p-6 mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
                Mis Solicitudes
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Revisa el estado de tus solicitudes y realiza los pagos
              </p>
            </div>

            {/* Error state */}
            {error && (
              <div className="glass rounded-lg p-6 mb-6 border border-red-200 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de solicitudes */}
            {solicitudes.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No tienes solicitudes
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Cuando solicites productos aparecerán aquí
                </p>
                <button 
                  onClick={() => window.location.href = '/productos'}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Ver Productos
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-xl p-6 border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      
                      {/* Información principal */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-full ${getEstadoColor(solicitud.estado)} text-white`}>
                              {getEstadoIcono(solicitud.estado)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                              {solicitud.producto_nombre}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <div>
                                <span className="font-medium">Cantidad:</span> {solicitud.cantidad}
                              </div>
                              <div>
                                <span className="font-medium">Total:</span> ${solicitud.precio_total?.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Fecha:</span> {formatearFecha(solicitud.created_at)}
                              </div>
                            </div>
                            {solicitud.requiere_transporte && (
                              <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                📦 Incluye servicio de transporte
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estado y acciones */}
                      <div className="flex flex-col items-start lg:items-end space-y-3">
                        {/* Indicador de proceso */}
                        <div className="text-xs space-y-1 mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">1. Solicitud:</span>
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${getEstadoColor(solicitud.estado)}`}>
                              {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">2. Pago:</span>
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${
                              solicitud.estado_pago === 'aprobado' ? 'bg-green-600' :
                              solicitud.estado_pago === 'comprobante_enviado' ? 'bg-yellow-500' :
                              solicitud.estado_pago === 'rechazado' ? 'bg-red-600' :
                              solicitud.estado === 'aprobada' ? 'bg-gray-500' : 'bg-gray-300'
                            }`}>
                              {solicitud.estado !== 'aprobada' ? 'Esperando aprobación' :
                               solicitud.estado_pago === 'aprobado' ? 'Aprobado' :
                               solicitud.estado_pago === 'comprobante_enviado' ? 'En revisión' :
                               solicitud.estado_pago === 'rechazado' ? 'Rechazado' :
                               'Pendiente'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">3. Compra Producto:</span>
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${getEstadoProductoColor(solicitud.estado_producto)}`}>
                              {solicitud.estado_producto === 'finalizada' ? 'Finalizada' :
                               solicitud.estado_producto === 'en_proceso' ? 'En Proceso' :
                               'Pendiente'}
                            </span>
                          </div>
                        </div>

                        {/* Botón de pago para solicitudes aprobadas */}
                        {solicitud.estado === 'aprobada' && (
                          <div className="space-y-2">
                            {/* Estado de pago */}
                            <div className="text-xs">
                              <span className="font-medium">Estado Pago: </span>
                              <span className={
                                solicitud.estado_pago === 'aprobado' ? 'text-green-600' :
                                solicitud.estado_pago === 'comprobante_enviado' ? 'text-yellow-600' :
                                solicitud.estado_pago === 'rechazado' ? 'text-red-600' :
                                'text-gray-600'
                              }>
                                {solicitud.estado_pago === 'aprobado' ? 'Aprobado' :
                                 solicitud.estado_pago === 'comprobante_enviado' ? 'Comprobante Enviado' :
                                 solicitud.estado_pago === 'rechazado' ? 'Rechazado' :
                                 'Pendiente'}
                              </span>
                            </div>
                            
                            {/* Botón de pago */}
                            {solicitud.estado_pago !== 'comprobante_enviado' && solicitud.estado_pago !== 'aprobado' ? (
                              <button
                                onClick={() => abrirModalPago(solicitud)}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>Proceder al Pago</span>
                              </button>
                            ) : solicitud.estado_pago === 'comprobante_enviado' ? (
                              <div className="space-y-2">
                                <button
                                  disabled
                                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium cursor-not-allowed w-full"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span>📄 Comprobante Enviado</span>
                                </button>
                                <p className="text-xs text-blue-600 text-center">
                                  El admin está revisando tu pago
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-emerald-500/20 dark:bg-emerald-500/10 backdrop-blur-sm rounded-lg border border-emerald-300/30 dark:border-emerald-500/20">
                                {/* Mostrar el mensaje completo de la base de datos si existe, o mensaje por defecto */}
                                {solicitud.mensaje && solicitud.mensaje.includes('¡Pago Aprobado!') ? (
                                  <p className="text-emerald-800 dark:text-emerald-300 font-medium whitespace-pre-line">{solicitud.mensaje}</p>
                                ) : (
                                  <>
                                    <p className="text-emerald-800 dark:text-emerald-300 font-medium">¡Pago Aprobado!</p>
                                    {solicitud.requiere_transporte && (
                                      <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                                        📞 El administrador se pondrá en contacto contigo para coordinar el transporte.
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mensaje adicional si está rechazada o requiere más info */}
                    {(solicitud.estado === 'rechazada' || solicitud.estado === 'mas_info') && (
                      <div className="mt-4 p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-700/20">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Estado:</span> 
                          {solicitud.mensaje || (solicitud.estado === 'rechazada' 
                            ? ' Tu solicitud ha sido rechazada. Vuelve a intentarlo.' 
                            : ' Se requiere más información. El administrador se pondrá en contacto contigo.')
                          }
                        </p>
                      </div>
                    )}

                    {/* Comentarios del Admin por Etapa */}
                    {(solicitud.comentario_solicitud || solicitud.comentario_pago || solicitud.comentario_producto) && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                          💬 Comentarios del Administrador
                        </h4>
                        
                        {/* Comentario de Solicitud */}
                        {solicitud.comentario_solicitud && (
                          <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Sobre tu solicitud:</span>
                            </div>
                            <p className="text-sm text-blue-700 dark:text-blue-400">{solicitud.comentario_solicitud}</p>
                          </div>
                        )}
                        
                        {/* Comentario de Pago */}
                        {solicitud.comentario_pago && (
                          <div className="p-3 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm rounded-lg border border-green-200/50 dark:border-green-700/30">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-medium text-green-800 dark:text-green-300">Sobre tu pago:</span>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-400">{solicitud.comentario_pago}</p>
                          </div>
                        )}
                        
                        {/* Comentario de Producto */}
                        {solicitud.comentario_producto && (
                          <div className="p-3 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-lg border border-purple-200/50 dark:border-purple-700/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-xs font-medium text-purple-800 dark:text-purple-300">Sobre tu producto:</span>
                            </div>
                            <p className="text-sm text-purple-700 dark:text-purple-400">{solicitud.comentario_producto}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Botón para actualizar */}
            <div className="mt-8 text-center">
              <button
                onClick={cargarMisSolicitudes}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Actualizando...' : 'Actualizar Solicitudes'}
              </button>
            </div>
          </div>
        </main>

        {/* Modal de pago */}
        {modalPago && solicitudSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Pago de Solicitud #{solicitudSeleccionada.id}
                  </h2>
                  <button
                    onClick={cerrarModalPago}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Resumen de tu solicitud:
                  </h3>
                  <div className="text-blue-700 dark:text-blue-400 text-sm">
                    <p><strong>Producto:</strong> {solicitudSeleccionada.producto_nombre}</p>
                    <p><strong>Cantidad:</strong> {solicitudSeleccionada.cantidad}</p>
                    <p><strong>Total a pagar:</strong> ${solicitudSeleccionada.precio_total?.toLocaleString()}</p>
                    {solicitudSeleccionada.requiere_transporte && (
                      <p className="text-blue-600 dark:text-blue-300 mt-2">
                        📦 <strong>Incluye transporte</strong>
                      </p>
                    )}
                  </div>
                </div>

                <TransferenciaComponent 
                  monto={`$${solicitudSeleccionada.precio_total?.toLocaleString()}`}
                  onSubmit={manejarEnvioComprobante}
                />
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </BackgroundWrapper>
  )
}