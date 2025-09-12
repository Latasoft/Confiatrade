'use client'

import { useState } from 'react'

export default function ProductosPage() {
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Productos estáticos
  const productos = [
    {
      id: 1,
      nombre: 'Aceite de Girasol',
      descripcion: '200 litros de aceite de girasol de alta calidad.',
      precio: 120000,
      ubicacion: 'Mendoza, Argentina',
      categoria: 'aceites',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Aceite+de+Girasol',
      proveedor: 'AgroMendoza S.A.',
      stock: 50
    },
    {
      id: 2,
      nombre: 'Trigo Premium',
      descripcion: '3 toneladas de trigo de primera calidad.',
      precio: 150000,
      ubicacion: 'Buenos Aires, Argentina',
      categoria: 'cereales',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Trigo+Premium',
      proveedor: 'Cereales del Sur',
      stock: 25
    },
    {
      id: 3,
      nombre: 'Cereales Mixtos',
      descripcion: '500kg de cereales variados para exportación.',
      precio: 80000,
      ubicacion: 'Concepción, Chile',
      categoria: 'cereales',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Cereales+Mixtos',
      proveedor: 'ChileGranos Ltd.',
      stock: 75
    },
    {
      id: 4,
      nombre: 'Aceite de Oliva Extra Virgen',
      descripcion: '100 litros de aceite de oliva premium.',
      precio: 200000,
      ubicacion: 'Santiago, Chile',
      categoria: 'aceites',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Aceite+Oliva',
      proveedor: 'Olivos del Valle',
      stock: 30
    },
    {
      id: 5,
      nombre: 'Quinoa Orgánica',
      descripcion: '1 tonelada de quinoa orgánica certificada.',
      precio: 250000,
      ubicacion: 'Altiplano, Bolivia',
      categoria: 'cereales',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Quinoa+Organica',
      proveedor: 'Altiplano Foods',
      stock: 15
    },
    {
      id: 6,
      nombre: 'Miel de Abeja Pura',
      descripcion: '50kg de miel de abeja 100% natural.',
      precio: 75000,
      ubicacion: 'Valdivia, Chile',
      categoria: 'otros',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Miel+Pura',
      proveedor: 'Apícola del Sur',
      stock: 40
    }
  ]

  const handleSolicitar = (producto) => {
    alert(`Solicitud enviada para ${producto.nombre}`)
  }

  const productosFiltrados = productos.filter(producto => {
    const matchCategoria = filtroCategoria === 'todos' || producto.categoria === filtroCategoria
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategoria && matchSearch
  })

  const categorias = ['todos', 'aceites', 'cereales', 'otros']

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Catálogo de Productos
        </h1>
        <p className="text-gray-600 text-lg">
          Descubre nuestra amplia gama de productos agrícolas disponibles para comercio internacional
        </p>
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
                  {producto.disponible ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {producto.descripcion}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Ubicación:</span>
                  <span className="ml-1">{producto.ubicacion}</span>
                </div>
                {producto.proveedor && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Proveedor:</span>
                    <span className="ml-1">{producto.proveedor}</span>
                  </div>
                )}
                {producto.stock && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Stock:</span>
                    <span className="ml-1">{producto.stock} unidades</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-green-600">
                  ${producto.precio.toLocaleString()}
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
    </div>
  )
}
