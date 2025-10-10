'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'

export default function MisSolicitudesPage() {
  const { user } = useUser()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [modalDetalle, setModalDetalle] = useState(false)
  const [solicitudActual, setSolicitudActual] = useState(null)

  useEffect(() => {
    if (user) {
      cargarSolicitudes()
    }
  }, [user, filtro])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('solicitudes_compra')
        .select('*')
        .eq('cliente_id', user.id)

      if (filtro !== 'todas') {
        query = query.eq('estado', filtro)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setSolicitudes(data || [])
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
      toast.error('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const verDetalle = (solicitud) => {
    setSolicitudActual(solicitud)
    setModalDetalle(true)
  }

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-500',
      'aceptado': 'bg-green-500',
      'rechazado': 'bg-red-500',
      'en_transito': 'bg-blue-500',
      'entregado': 'bg-purple-500',
      'no_aplica': 'bg-gray-400'
    }
    return colores[estado] || 'bg-gray-400'
  }

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado',
      'en_transito': 'En Tránsito',
      'entregado': 'Entregado',
      'no_aplica': 'No Aplica'
    }
    return textos[estado] || estado
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Solicitudes</h1>
        <p className="text-gray-600">Gestiona y revisa el estado de tus solicitudes de productos</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['todas', 'pendiente', 'aceptado', 'rechazado'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-4 py-2 rounded capitalize transition-colors ${
              filtro === estado 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {estado === 'todas' ? 'Todas' : getEstadoTexto(estado)}
          </button>
        ))}
      </div>

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No tienes solicitudes
          </h3>
          <p className="text-gray-500">
            {filtro !== 'todas' 
              ? `No hay solicitudes en estado "${getEstadoTexto(filtro)}"` 
              : 'Aún no has realizado ninguna solicitud de productos'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {solicitud.producto_nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Solicitud #{solicitud.id} • {new Date(solicitud.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${getEstadoColor(solicitud.estado)}`}>
                    {getEstadoTexto(solicitud.estado)}
                  </span>
                </div>

                {/* Detalles básicos */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cantidad:</span>
                    <span className="font-medium">{solicitud.cantidad} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio unitario:</span>
                    <span className="font-medium">${solicitud.precio_unitario?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-green-600">${solicitud.precio_total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Estados */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Producto</p>
                    <span className={`px-2 py-1 rounded text-white text-xs ${getEstadoColor(solicitud.estado)}`}>
                      {getEstadoTexto(solicitud.estado)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pago</p>
                    <span className={`px-2 py-1 rounded text-white text-xs ${getEstadoColor(solicitud.estado_pago)}`}>
                      {getEstadoTexto(solicitud.estado_pago)}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Envío</p>
                    <span className={`px-2 py-1 rounded text-white text-xs ${getEstadoColor(solicitud.estado_envio)}`}>
                      {getEstadoTexto(solicitud.estado_envio)}
                    </span>
                  </div>
                </div>

                {/* Transporte */}
                {solicitud.requiere_transporte && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-600 mr-2">🚚</span>
                      <span className="text-sm font-medium text-blue-800">Servicio de transporte solicitado</span>
                    </div>
                    {solicitud.numero_seguimiento && (
                      <p className="text-xs text-blue-600">
                        Número de seguimiento: {solicitud.numero_seguimiento}
                      </p>
                    )}
                  </div>
                )}

                {/* Comentario del admin */}
                {solicitud.comentario_admin && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-1">Comentario del administrador:</p>
                    <p className="text-sm text-gray-600">{solicitud.comentario_admin}</p>
                  </div>
                )}

                {/* Botón de ver detalles */}
                <button
                  onClick={() => verDetalle(solicitud)}
                  className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {modalDetalle && solicitudActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Solicitud #{solicitudActual.id}
                </h2>
                <p className="text-gray-600">
                  {solicitudActual.producto_nombre}
                </p>
              </div>
              <button
                onClick={() => setModalDetalle(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del producto */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Información del Producto</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Producto:</span>
                    <span className="font-medium">{solicitudActual.producto_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cantidad:</span>
                    <span className="font-medium">{solicitudActual.cantidad} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio unitario:</span>
                    <span className="font-medium">${solicitudActual.precio_unitario?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-green-600">${solicitudActual.precio_total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Estados */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Estados</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Estado del Producto:</span>
                    <div className={`inline-block ml-2 px-3 py-1 rounded text-white text-sm ${getEstadoColor(solicitudActual.estado)}`}>
                      {getEstadoTexto(solicitudActual.estado)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Estado del Pago:</span>
                    <div className={`inline-block ml-2 px-3 py-1 rounded text-white text-sm ${getEstadoColor(solicitudActual.estado_pago)}`}>
                      {getEstadoTexto(solicitudActual.estado_pago)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Estado del Envío:</span>
                    <div className={`inline-block ml-2 px-3 py-1 rounded text-white text-sm ${getEstadoColor(solicitudActual.estado_envio)}`}>
                      {getEstadoTexto(solicitudActual.estado_envio)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de transporte */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Información de Transporte</h3>
              {solicitudActual.requiere_transporte ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-600 mr-2">🚚</span>
                    <span className="font-medium text-blue-800">Servicio de transporte solicitado</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Dirección de entrega:</strong> {solicitudActual.direccion_entrega}
                  </p>
                  {solicitudActual.numero_seguimiento && (
                    <p className="text-sm text-blue-600">
                      <strong>Número de seguimiento:</strong> {solicitudActual.numero_seguimiento}
                    </p>
                  )}
                  {solicitudActual.fecha_envio && (
                    <p className="text-sm text-gray-600">
                      <strong>Fecha de envío:</strong> {new Date(solicitudActual.fecha_envio).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 italic">No se solicitó servicio de transporte (retiro en origen)</p>
              )}
            </div>

            {/* Mensajes */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Comunicación</h3>
              {solicitudActual.mensaje && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 mb-1">Tu mensaje:</p>
                  <p className="text-sm text-gray-600">{solicitudActual.mensaje}</p>
                </div>
              )}
              {solicitudActual.comentario_admin && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Respuesta del administrador:</p>
                  <p className="text-sm text-blue-700">{solicitudActual.comentario_admin}</p>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Fecha de solicitud:</strong><br />
                  {new Date(solicitudActual.created_at).toLocaleString()}
                </div>
                {solicitudActual.fecha_respuesta && (
                  <div>
                    <strong>Fecha de respuesta:</strong><br />
                    {new Date(solicitudActual.fecha_respuesta).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}