'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar transportes desde Supabase
  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      
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
      } else if (data && data.length > 0) {
        toast.success(`✅ ${data.length} productos cargados Correctamente`)
        console.log('✅ Productos establecidos en estado:', data)
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      setError(error.message)
      toast.error('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Formatear datos de Supabase
  const formatearProducto = (producto) => {
    return {
      id: producto.id,
      nombre: producto.nombre || 'Producto',
      descripcion: producto.descripcion || 'Sin descripción',
      precio: producto.precio || 0,
      ubicacion: producto.ubicacion || 'Ubicación no especificada',
      categoria: producto.categoria || 'sin-categoria',
      disponible: true, // Por defecto disponible
      imagen: producto.imagen_url || 'https://via.placeholder.com/300x200?text=Producto',
      proveedor: producto.proveedor || 'Proveedor',
      stock: producto.stock || 0
    }
  }

  const productosFormateados = productos.map(formatearProducto)

  // Filtrar productos por búsqueda
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
      console.log('� Solicitando producto:', producto)
      toast.success(`Solicitud enviada para ${producto.nombre}`)
    } catch (error) {
      console.error('Error enviando solicitud:', error)
      toast.error('Error al enviar la solicitud')
    }
  }

  const refrescarDatos = () => {
    cargarProductos()
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavbarCliente />
        <div className="flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Cargando productos...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarCliente />
      <div className="flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Productos Agrícolas
              </h1>
              <p className="text-gray-600 text-lg">
                Descubre los mejores productos agrícolas de nuestra red de proveedores
              </p>
            </div>
            <button
              onClick={refrescarDatos}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔄 Refrescar
            </button>
          </div>
          
          {/* Estado de conexión */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">❌ Error de conexión</p>
              <p className="text-sm">No se pudo conectar con la base de datos: {error}</p>
            </div>
          )}
          
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Buscar Productos</h2>
          
          <div>
            <input
              type="text"
              placeholder="Buscar por nombre, ubicación, categoría, proveedor..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Imagen */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    producto.disponible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.disponible ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {producto.descripcion}
                </p>

                {/* Detalles */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">{producto.ubicacion}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium capitalize">{producto.categoria.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Proveedor:</span>
                    <span className="font-medium">{producto.proveedor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">{producto.stock} unidades</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${producto.precio?.toLocaleString() || 'Consultar'}
                  </div>
                  <button
                    onClick={() => handleSolicitar(producto)}
                    disabled={!producto.disponible}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      producto.disponible
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {producto.disponible ? 'Solicitar' : 'No Disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
        {!loading && productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {error ? 'Error de conexión' : 'No se encontraron productos'}
            </h3>
            <p className="text-gray-500">
              {error ? error : 'Intenta ajustar tu búsqueda o filtros'}
            </p>
            {error && (
              <div className="mt-4">
                <button
                  onClick={refrescarDatos}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Reintentar Conexión
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  )
}