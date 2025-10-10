'use client'

import { SignInButton, useUser } from '@clerk/nextjs'

export function ProductCard({ 
  producto, 
  onSolicitar, 
  onEdit, 
  onDelete, 
  onStatusChange,
  showAdminActions = false 
}) {
  const { isSignedIn } = useUser()

  const formatearPrecio = (precio) => {
    if (!precio) return 'Consultar'
    return `$${precio.toLocaleString()}`
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible': return 'bg-green-500'
      case 'agotado': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="glass rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full h-full flex flex-col">
      {/* Imagen */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img 
          src={producto.imagen_url || producto.imagen || 'https://via.placeholder.com/200x200/ffffff/cccccc?text=Producto'} 
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
          <span className={`px-1 py-0.5 text-xs rounded text-white ${
            showAdminActions ? getEstadoColor(producto.estado) : 
            (producto.disponible !== false ? 'bg-green-500' : 'bg-red-500')
          }`}>
            {showAdminActions ? producto.estado : 
             (producto.disponible !== false ? 'Disponible' : 'No Disponible')}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-1">
          {producto.descripcion}
        </p>

        {/* Detalles */}
        <div className="space-y-1 mb-2 flex-1">
          <div className="flex justify-between text-xs">
            <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
              {showAdminActions ? 'Precio:' : 'Ubicación:'}
            </span>
            <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium truncate ml-1">
              {showAdminActions ? formatearPrecio(producto.precio) : (producto.ubicacion || 'N/A')}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
              {showAdminActions ? 'Stock:' : 'Categoría:'}
            </span>
            <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium truncate ml-1">
              {showAdminActions ? 
                `${producto.stock} ${producto.unidad || 'uds'}` : 
                (producto.categoria?.replace('-', ' ') || 'N/A')}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">
              {showAdminActions ? 'Ubicación:' : 'Proveedor:'}
            </span>
            <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium truncate ml-1">
              {showAdminActions ? (producto.ubicacion || 'N/A') : (producto.proveedor || 'N/A')}
            </span>
          </div>
          
          {!showAdminActions && (
            <div className="flex justify-between text-xs">
              <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs">Stock:</span>
              <span className="bg-gray-600 dark:bg-gray-500 text-white px-1 py-0.5 rounded text-xs font-medium ml-1">
                {producto.stock || 'N/A'}
              </span>
            </div>
          )}
        </div>

        {/* Precio y Botones */}
        <div className="mt-auto">
          {!showAdminActions && (
            <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-2 text-center">
              {formatearPrecio(producto.precio)}
            </div>
          )}
          
          {/* Botones */}
          {showAdminActions ? (
            // Botones de administración
            <div className="space-y-1">
              <button
                onClick={() => onEdit && onEdit(producto)}
                className="w-full px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-medium transition-colors"
              >
                Editar
              </button>
              
              {producto.estado === 'disponible' ? (
                <button
                  onClick={() => onStatusChange && onStatusChange(producto.id, 'agotado')}
                  className="w-full px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-medium transition-colors"
                >
                  Agotar
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange && onStatusChange(producto.id, 'disponible')}
                  className="w-full px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium transition-colors"
                >
                  Activar
                </button>
              )}
              
              <button
                onClick={() => onDelete && onDelete(producto.id)}
                className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          ) : (
            // Botones de cliente
            <>
              {!producto.disponible ? (
                <button
                  disabled
                  className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed px-2 py-1 rounded text-xs font-medium"
                >
                  No Disponible
                </button>
              ) : !isSignedIn ? (
                <SignInButton>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200">
                    Iniciar Sesión
                  </button>
                </SignInButton>
              ) : (
                <button
                  onClick={() => onSolicitar && onSolicitar(producto)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200"
                >
                  Solicitar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}