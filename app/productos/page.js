'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductGrid } from '@/components/ui/ProductGrid'

export default function ProductosPage() {
  const { user } = useUser()
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
      toast.error('🔒 Debes iniciar sesión para enviar una solicitud')
      return
    }

    if (!productoSeleccionado) return

    // Validaciones de cantidad
    if (!formSolicitud.cantidad || formSolicitud.cantidad <= 0) {
      toast.error('⚠️ Debes especificar una cantidad válida')
      return
    }

    if (formSolicitud.cantidad < 100) {
      toast.error('⚠️ La cantidad mínima es de 100 ' + (productoSeleccionado.unidad || 'unidades'))
      return
    }

    if (formSolicitud.cantidad > productoSeleccionado.stock) {
      toast.error('⚠️ No hay suficiente stock disponible')
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
        mensaje: (formSolicitud.mensaje || formSolicitud.comentarios || '').trim() || null,
        requiere_transporte: formSolicitud.requiere_transporte,
        direccion_entrega: formSolicitud.requiere_transporte ? 'Coordinará con vendedor' : null,
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
      toast.success('🎉 ¡Solicitud enviada exitosamente! Revisa el estado en "Mis Solicitudes"', {
        duration: 5000
      })
      
      // Limpiar formulario
      setFormSolicitud({
        cantidad: '',
        mensaje: '',
        comentarios: '',
        requiere_transporte: false,
        direccion_entrega: ''
      })
      
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

  const handleSolicitar = (producto) => {
    if (!user) {
      toast.error('🔒 Debes iniciar sesión para solicitar productos')
      return
    }
    
    console.log('🛒 Abriendo modal para producto:', producto)
    setProductoSeleccionado(producto)
    setModalSolicitud(true)
    
    // Resetear formulario
    setFormSolicitud({
      cantidad: '',
      mensaje: '',
      comentarios: '',
      requiere_transporte: false,
      direccion_entrega: ''
    })
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
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header con glass effect */}
          <div className="glass rounded-2xl p-6 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
              Productos Agrícolas
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Descubre los mejores productos agrícolas de nuestra red de proveedores
            </p>
          </div>

          {/* Buscador con glass effect */}
          <div className="glass rounded-xl p-6 mb-8">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-white/30 dark:border-gray-700/30 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-white/20 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  Solicitar Producto
                </h2>
                <button
                  onClick={() => setModalSolicitud(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Producto info compacta */}
              <div className="flex items-start space-x-4 p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20">
                <img 
                  src={productoSeleccionado.imagen_url || 'https://via.placeholder.com/80x80/f0f0f0/cccccc?text=Producto'} 
                  alt={productoSeleccionado.nombre}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                    {productoSeleccionado.nombre}
                  </h3>
                  <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ${productoSeleccionado.precio?.toLocaleString()}/{productoSeleccionado.unidad || 'unidad'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Stock: {productoSeleccionado.stock}</p>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad a solicitar *
                </label>
                <input
                  type="number"
                  min="100"
                  max={productoSeleccionado.stock}
                  value={formSolicitud.cantidad}
                  onChange={(e) => setFormSolicitud(prev => ({
                    ...prev,
                    cantidad: e.target.value
                  }))}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Ej: 100"
                />
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  • Cantidad mínima: 100 {productoSeleccionado.unidad || 'unidades'}
                </p>
                {formSolicitud.cantidad && formSolicitud.cantidad < 100 && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ La cantidad mínima es de 100 {productoSeleccionado.unidad || 'unidades'}
                  </p>
                )}
              </div>

              {/* Transporte */}
              <div>
                <div className="flex items-center space-x-3 p-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-700/20">
                  <input
                    type="checkbox"
                    id="requiere_transporte"
                    checked={formSolicitud.requiere_transporte}
                    onChange={(e) => setFormSolicitud(prev => ({
                      ...prev,
                      requiere_transporte: e.target.checked,
                      direccion_entrega: e.target.checked ? prev.direccion_entrega : ''
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="requiere_transporte" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    🚛 Necesito servicio de transporte
                  </label>
                </div>
              </div>

              {/* Mensaje informativo si requiere transporte */}
              {formSolicitud.requiere_transporte && (
                <div className="p-3 bg-blue-500/20 dark:bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-300/30 dark:border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ℹ️ Luego de realizar la compra se le comunicará con el vendedor para coordinar transporte
                  </p>
                </div>
              )}

              {/* Resumen compacto */}
              {formSolicitud.cantidad > 0 && (
                <div className="p-3 bg-emerald-500/20 dark:bg-emerald-500/10 backdrop-blur-sm rounded-lg border border-emerald-300/30 dark:border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total estimado:</span>
                    <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      ${((productoSeleccionado.precio || 0) * (formSolicitud.cantidad || 0)).toLocaleString()}
                    </span>
                  </div>
                  {formSolicitud.requiere_transporte && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+ Transporte incluido</p>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 p-6 border-t border-white/20 dark:border-gray-700/30">
              <button
                onClick={() => setModalSolicitud(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-gray-800/30 border border-white/40 dark:border-gray-600/40 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={enviarSolicitud}
                disabled={!formSolicitud.cantidad || formSolicitud.cantidad < 100}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                📤 Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}