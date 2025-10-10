'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductGrid } from '@/components/ui/ProductGrid'

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalSolicitud, setModalSolicitud] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [formSolicitud, setFormSolicitud] = useState({
    cantidad: 1,
    mensaje: '',
    requiere_transporte: false,
    direccion_entrega: ''
  })

  // Cargar transportes desde Supabase
  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      setError(null) // ← AHORA ESTO FUNCIONARÁ
      
      console.log('🚀 Iniciando carga de productos...')
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      console.log('📦 Datos recibidos:', data)

      setProductos(data || [])

      if (data && data.length === 0) {
        toast.info('No hay productos disponibles')
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      setError(error.message) // ← AHORA ESTO FUNCIONARÁ
      toast.error('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const abrirModalSolicitud = (producto) => {
    setProductoSeleccionado(producto)
    setFormSolicitud({ 
      cantidad: 1, 
      mensaje: '', 
      requiere_transporte: false,
      direccion_entrega: ''
    })
    setModalSolicitud(true)
  }

  const enviarSolicitud = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para enviar una solicitud')
      return
    }

    if (!productoSeleccionado) return

    // Validar dirección si requiere transporte
    if (formSolicitud.requiere_transporte && !formSolicitud.direccion_entrega.trim()) {
      toast.error('Debes proporcionar una dirección de entrega')
      return
    }

    try {
      const precioTotal = productoSeleccionado.precio * formSolicitud.cantidad

      const solicitudData = {
        cliente_id: user.id,
        cliente_email: user.emailAddresses[0]?.emailAddress || '',
        cliente_nombre: user.firstName + ' ' + (user.lastName || ''),
        producto_id: productoSeleccionado.id,
        producto_nombre: productoSeleccionado.nombre,
        cantidad: parseInt(formSolicitud.cantidad),
        precio_unitario: productoSeleccionado.precio,
        precio_total: precioTotal,
        mensaje: formSolicitud.mensaje.trim() || null,
        requiere_transporte: formSolicitud.requiere_transporte,
        direccion_entrega: formSolicitud.requiere_transporte ? formSolicitud.direccion_entrega.trim() : null,
        estado: 'pendiente',
        estado_pago: 'pendiente',
        estado_envio: formSolicitud.requiere_transporte ? 'pendiente' : 'no_aplica'
      }

      console.log('📝 Enviando solicitud:', solicitudData)

      const { data, error } = await supabase
        .from('solicitudes_compra')
        .insert([solicitudData])
        .select()

      if (error) {
        console.error('Error al enviar solicitud:', error)
        toast.error('Error al enviar la solicitud: ' + error.message)
        return
      }

      console.log('✅ Solicitud enviada:', data)
      toast.success('¡Solicitud enviada exitosamente!')
      setModalSolicitud(false)
      setProductoSeleccionado(null)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error inesperado al enviar la solicitud')
    }
  }

  const formatearProducto = (producto) => {
    return {
      id: producto.id,
      nombre: producto.nombre || 'Producto',
      descripcion: producto.descripcion || 'Sin descripción',
      precio: producto.precio || 0,
      ubicacion: producto.ubicacion || 'Ubicación no especificada',
      categoria: producto.categoria || 'sin-categoria',
      disponible: true,
      imagen_url: producto.imagen_url || producto.imagen || 'https://via.placeholder.com/300x200?text=Producto',
      proveedor: producto.proveedor || 'Proveedor',
      stock: producto.stock || 0
    }
  }

  const productosFormateados = productos.map(formatearProducto)
  const productosFiltrados = productosFormateados.filter(producto => {
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  const handleSolicitar = async (producto) => {
    try {
      console.log('🛒 Solicitando producto:', producto)
      toast.success(`Solicitud enviada para ${producto.nombre}`)
    } catch (error) {
      console.error('Error enviando solicitud:', error)
      toast.error('Error al enviar la solicitud')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavbarCliente />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando productos...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const refrescarDatos = async () => {
    await cargarProductos()
    toast.success('Datos actualizados')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarCliente />
      <div className="flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Productos Agrícolas
            </h1>
            <p className="text-gray-600 text-lg">
              Descubre los mejores productos agrícolas de nuestra red de proveedores
            </p>
          </div>

          {/* Buscador */}
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Grid de productos */}
          <ProductGrid>
            {productosFiltrados.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onSolicitar={handleSolicitar}
                showAdminActions={false}
              />
            ))}
          </ProductGrid>

          {/* Mensaje si no hay productos */}
          {!loading && productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500">
                Intenta ajustar tu búsqueda o filtros
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de solicitud */}
      {modalSolicitud && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Solicitar Producto</h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800">{productoSeleccionado.nombre}</h3>
              <p className="text-sm text-gray-600">{productoSeleccionado.descripcion}</p>
              <p className="text-lg font-bold text-green-600 mt-2">
                ${productoSeleccionado.precio?.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  max={productoSeleccionado.stock}
                  value={formSolicitud.cantidad}
                  onChange={(e) => setFormSolicitud(prev => ({
                    ...prev,
                    cantidad: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Checkbox para transporte */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="requiere_transporte"
                  checked={formSolicitud.requiere_transporte}
                  onChange={(e) => setFormSolicitud(prev => ({
                    ...prev,
                    requiere_transporte: e.target.checked,
                    direccion_entrega: e.target.checked ? prev.direccion_entrega : ''
                  }))}
                  className="mt-1"
                />
                <label htmlFor="requiere_transporte" className="text-sm">
                  <span className="font-medium">Necesito servicio de transporte</span>
                  <p className="text-gray-600 text-xs">
                    Selecciona esta opción si necesitas que el producto sea enviado a tu dirección
                  </p>
                </label>
              </div>

              {/* Dirección de entrega (condicional) */}
              {formSolicitud.requiere_transporte && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de entrega *
                  </label>
                  <textarea
                    value={formSolicitud.direccion_entrega}
                    onChange={(e) => setFormSolicitud(prev => ({
                      ...prev,
                      direccion_entrega: e.target.value
                    }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ingresa tu dirección completa para la entrega..."
                    required={formSolicitud.requiere_transporte}
                  />
                </div>
              )}

              {/* Mensaje adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje adicional (opcional)
                </label>
                <textarea
                  value={formSolicitud.mensaje}
                  onChange={(e) => setFormSolicitud(prev => ({
                    ...prev,
                    mensaje: e.target.value
                  }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Algún detalle adicional sobre tu solicitud..."
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Resumen de solicitud:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Cantidad:</span>
                  <span>{formSolicitud.cantidad} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio unitario:</span>
                  <span>${productoSeleccionado.precio?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transporte:</span>
                  <span>{formSolicitud.requiere_transporte ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>${((productoSeleccionado.precio || 0) * formSolicitud.cantidad).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Refresh button - moved outside resumen */}
            <div className="mt-4">
              <button
                onClick={refrescarDatos}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🔄 Refrescar Datos
              </button>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalSolicitud(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={enviarSolicitud}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}