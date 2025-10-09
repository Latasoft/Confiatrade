'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function SolicitudesCompraAdminPage() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalSolicitud, setModalSolicitud] = useState(false)
  const [solicitudActual, setSolicitudActual] = useState(null)
  const [filtro, setFiltro] = useState('pendiente')
  const [formAdmin, setFormAdmin] = useState({
    comentario: '',
    numero_seguimiento: ''
  })

  useEffect(() => {
    cargarSolicitudes()
  }, [filtro])

  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      let query = supabase.from('solicitudes_compra').select('*')
      
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

  const verDetalles = (solicitud) => {
    setSolicitudActual(solicitud)
    setFormAdmin({
      comentario: solicitud.comentario_admin || '',
      numero_seguimiento: solicitud.numero_seguimiento || ''
    })
    setModalSolicitud(true)
  }

  const actualizarEstado = async (campo, nuevoEstado) => {
    try {
      const updateData = {
        [campo]: nuevoEstado,
        fecha_respuesta: new Date().toISOString()
      }

      if (formAdmin.comentario.trim()) {
        updateData.comentario_admin = formAdmin.comentario.trim()
      }

      if (formAdmin.numero_seguimiento.trim() && solicitudActual.requiere_transporte) {
        updateData.numero_seguimiento = formAdmin.numero_seguimiento.trim()
        if (nuevoEstado === 'en_transito') {
          updateData.fecha_envio = new Date().toISOString()
        }
      }

      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
        .eq('id', solicitudActual.id)

      if (error) throw error
      
      toast.success('Estado actualizado correctamente')
      setModalSolicitud(false)
      cargarSolicitudes()
    } catch (error) {
      console.error('Error al actualizar solicitud:', error)
      toast.error('Error al actualizar la solicitud')
    }
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Solicitudes de Compra</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['todas', 'pendiente', 'aceptado', 'rechazado'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-4 py-2 rounded capitalize ${
              filtro === estado 
                ? 'bg-blue-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {estado}
          </button>
        ))}
      </div>

      {/* Lista de solicitudes */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-lg bg-white">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Cantidad</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Transporte</th>
                <th className="p-3 text-left">Estados</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3">#{solicitud.id}</td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{solicitud.cliente_nombre}</div>
                      <div className="text-sm text-gray-600">{solicitud.cliente_email}</div>
                    </div>
                  </td>
                  <td className="p-3">{solicitud.producto_nombre}</td>
                  <td className="p-3">{solicitud.cantidad} unidades</td>
                  <td className="p-3 font-medium">
                    ${solicitud.precio_total?.toLocaleString()}
                  </td>
                  <td className="p-3">
                    {solicitud.requiere_transporte ? (
                      <span className="text-blue-600">🚚 Sí</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className={`px-2 py-1 rounded text-white text-xs ${getEstadoColor(solicitud.estado)}`}>
                        P: {solicitud.estado}
                      </div>
                      <div className={`px-2 py-1 rounded text-white text-xs ${getEstadoColor(solicitud.estado_pago)}`}>
                        $: {solicitud.estado_pago}
                      </div>
                      <div className={`px-2 py-1 rounded text-white text-xs ${getEstadoColor(solicitud.estado_envio)}`}>
                        E: {solicitud.estado_envio}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {new Date(solicitud.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => verDetalles(solicitud)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de gestión */}
      {modalSolicitud && solicitudActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Gestionar Solicitud #{solicitudActual.id}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Información de la solicitud */}
              <div>
                <h3 className="font-semibold mb-2">Información del Cliente</h3>
                <div className="space-y-1 text-sm mb-4">
                  <p><strong>Nombre:</strong> {solicitudActual.cliente_nombre}</p>
                  <p><strong>Email:</strong> {solicitudActual.cliente_email}</p>
                </div>

                <h3 className="font-semibold mb-2">Información del Pedido</h3>
                <div className="space-y-1 text-sm mb-4">
                  <p><strong>Producto:</strong> {solicitudActual.producto_nombre}</p>
                  <p><strong>Cantidad:</strong> {solicitudActual.cantidad} unidades</p>
                  <p><strong>Total:</strong> ${solicitudActual.precio_total?.toLocaleString()}</p>
                </div>

                {solicitudActual.requiere_transporte && (
                  <div>
                    <h3 className="font-semibold mb-2">Información de Transporte</h3>
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <p><strong>Dirección:</strong> {solicitudActual.direccion_entrega}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel de gestión */}
              <div>
                <h3 className="font-semibold mb-4">Gestión de Estados</h3>
                
                {/* Estado del producto */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Estado del Producto:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => actualizarEstado('estado', 'aceptado')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => actualizarEstado('estado', 'rechazado')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>

                {/* Estado del pago */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Estado del Pago:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => actualizarEstado('estado_pago', 'aceptado')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Pago Confirmado
                    </button>
                    <button
                      onClick={() => actualizarEstado('estado_pago', 'rechazado')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Pago Rechazado
                    </button>
                  </div>
                </div>

                {/* Estado del envío (solo si requiere transporte) */}
                {solicitudActual.requiere_transporte && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Estado del Envío:</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => actualizarEstado('estado_envio', 'en_transito')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        En Tránsito
                      </button>
                      <button
                        onClick={() => actualizarEstado('estado_envio', 'entregado')}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        Entregado
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Número de seguimiento"
                      value={formAdmin.numero_seguimiento}
                      onChange={(e) => setFormAdmin(prev => ({...prev, numero_seguimiento: e.target.value}))}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  </div>
                )}

                {/* Comentario */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comentario para el cliente:</label>
                  <textarea
                    value={formAdmin.comentario}
                    onChange={(e) => setFormAdmin(prev => ({...prev, comentario: e.target.value}))}
                    className="w-full border rounded p-2 text-sm"
                    rows="3"
                    placeholder="Añade un comentario..."
                  />
                </div>
              </div>
            </div>
            
            {/* Estados actuales */}
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Estados Actuales:</h4>
              <div className="flex gap-4 text-sm">
                <span className={`px-2 py-1 rounded text-white ${getEstadoColor(solicitudActual.estado)}`}>
                  Producto: {solicitudActual.estado}
                </span>
                <span className={`px-2 py-1 rounded text-white ${getEstadoColor(solicitudActual.estado_pago)}`}>
                  Pago: {solicitudActual.estado_pago}
                </span>
                <span className={`px-2 py-1 rounded text-white ${getEstadoColor(solicitudActual.estado_envio)}`}>
                  Envío: {solicitudActual.estado_envio}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalSolicitud(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}