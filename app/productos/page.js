'use client'

import { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function ProductosPage() {
  const { isSignedIn, user } = useUser()
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
        toast.info('No hay productos disponibles');
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
    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para solicitar productos')
      return
    }

    try {
      console.log('🛒 Solicitando producto:', producto)
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
        <Navbar />
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="glass rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Cargando productos...</p>
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
      <Navbar />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent mb-4">
                  Productos Agrícolas
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Descubre los mejores productos agrícolas de nuestra red de proveedores
                </p>
              </div>
              <button
                onClick={refrescarDatos}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🔄 Refrescar
              </button>
            </div>

            {/* Estado de conexión */}
            {error && (
              <div className="mt-4 p-4 glass border-l-4 border-red-500 rounded-xl">
                <p className="font-medium text-red-600 dark:text-red-400">❌ Error de conexión</p>
                <p className="text-sm text-red-500 dark:text-red-300">No se pudo conectar con la base de datos: {error}</p>
              </div>
            )}

          </div>

          {/* Filtros */}
          <div className="mb-8 glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Buscar Productos</h2>

            <div>
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación, categoría, proveedor..."
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="glass rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full h-full flex flex-col"
              >
                {/* Imagen */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200/ffffff/cccccc?text=Producto';
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="p-3 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">
                      {producto.nombre}
                    </h3>
                    <span className={`px-1 py-0.5 rounded text-xs ${producto.disponible
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                      }`}>
                      {producto.disponible ? 'Disponible' : 'No Disponible'}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-1">
                    {producto.descripcion}
                  </p>

                  {/* Detalles */}
                  <div className="space-y-1 mb-2 flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">Ubicación:</span>
                      <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium truncate ml-1">{producto.ubicacion}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">Categoría:</span>
                      <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium capitalize truncate ml-1">{producto.categoria.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">Stock:</span>
                      <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium ml-1">{producto.stock}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-2 text-center">
                      ${producto.precio?.toLocaleString() || 'Consultar'}
                    </div>
                    
                    {/* Botón condicional según autenticación y disponibilidad */}
                    {!producto.disponible ? (
                      // Producto no disponible
                      <button
                        disabled
                        className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed px-2 py-1 rounded text-xs font-medium"
                      >
                        No Disponible
                      </button>
                    ) : !isSignedIn ? (
                      // Usuario no logueado - Mostrar botón para iniciar sesión
                      <SignInButton>
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200">
                          Iniciar Sesión
                        </button>
                      </SignInButton>
                    ) : (
                      // Usuario logueado y producto disponible
                      <button
                        onClick={() => handleSolicitar(producto)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200"
                      >
                        Solicitar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje si no hay productos */}
          {!loading && productosFiltrados.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {error ? 'Error de conexión' : 'No se encontraron productos'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {error ? error : 'Intenta ajustar tu búsqueda o filtros'}
              </p>
              {error && (
                <div className="mt-4">
                  <button
                    onClick={refrescarDatos}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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