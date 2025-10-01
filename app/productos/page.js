'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'
import CartWidget from '@/components/CartWidget'
import { useCart } from '@/lib/CartContext'
import { utilidadesService } from '@/lib/webpayServices'

export default function ProductosPage() {
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { addItem, getItemQuantity } = useCart()

  // Cargar productos desde la API
  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/productos?activo=true')
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      const data = await response.json()
      setProductos(data.productos || [])
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError(err.message)
      // Fallback a productos estáticos si hay error
      setProductos([
        {
          id: 1,
          nombre: 'Aceite de Girasol',
          descripcion: '200 litros de aceite de girasol de alta calidad.',
          precio: 120000,
          categoria: 'aceites',
          activo: true
        },
        {
          id: 2,
          nombre: 'Trigo Premium',
          descripcion: '3 toneladas de trigo de primera calidad.',
          precio: 150000,
          categoria: 'cereales',
          activo: true
        },
        {
          id: 3,
          nombre: 'Cereales Mixtos',
          descripcion: '500kg de cereales variados para exportación.',
          precio: 80000,
          categoria: 'cereales',
          activo: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarCarrito = (producto) => {
    addItem(producto)
    // Opcional: mostrar notificación
    alert(`${producto.nombre} agregado al carrito`)
  }

  const productosFiltrados = productos.filter(producto => {
    const matchCategoria = filtroCategoria === 'todos' || producto.categoria === filtroCategoria
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategoria && matchSearch && producto.activo
  })

  const categorias = ['todos', 'aceites', 'cereales', 'otros']

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Catálogo de Productos
            </h1>
            <p className="text-gray-600 text-lg">
              Descubre nuestra amplia gama de productos agrícolas disponibles para comercio internacional
            </p>
            {error && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                Mostrando productos de ejemplo debido a: {error}
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por categoría */}
            <div>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
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
                    src={producto.imagen_url || `https://via.placeholder.com/300x200?text=${encodeURIComponent(producto.nombre)}`}
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
                      producto.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.activo ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {producto.descripcion}
                  </p>

                  <div className="space-y-2 mb-4">
                    {producto.ubicacion && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Ubicación:</span>
                        <span className="ml-1">{producto.ubicacion}</span>
                      </div>
                    )}
                    {producto.proveedor && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Proveedor:</span>
                        <span className="ml-1">{producto.proveedor}</span>
                      </div>
                    )}
                    {producto.stock && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="font-medium">Stock:</span>
                        <span className="ml-1">{producto.stock} {producto.unidad || 'unidades'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-600">
                      {utilidadesService.formatearPrecio(producto.precio)}
                    </div>
                    <div className="flex space-x-2">
                      {getItemQuantity(producto.id) > 0 && (
                        <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                          En carrito: {getItemQuantity(producto.id)}
                        </span>
                      )}
                      <button
                        onClick={() => handleAgregarCarrito(producto)}
                        disabled={!producto.activo}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          producto.activo
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {producto.activo ? 'Agregar al Carrito' : 'No Disponible'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje si no hay productos */}
          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-12 bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-green-700 mb-4">
              Contáctanos para solicitudes especiales o productos personalizados. 
              Trabajamos con una amplia red de proveedores en toda Latinoamérica.
            </p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Solicitar Producto Personalizado
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <CartWidget />
    </div>
  )
}