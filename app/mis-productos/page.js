'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { useUser } from '@clerk/nextjs'
import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'

export default function MisProductosPage() {
  const { user } = useUser()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProducto, setEditingProducto] = useState(null)
  const [usuarioDbId, setUsuarioDbId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    ubicacion: '',
    categoria: '',
    proveedor: '',
    stock: '',
    imagen_url: null
  })
  const [imagenPreview, setImagenPreview] = useState(null)
  const [archivoImagen, setArchivoImagen] = useState(null)

  const categorias = [
    'cereales',
    'aceites',
    'frutas',
    'vegetales',
    'lacteos',
    'carnes',
    'especias',
    'granos',
    'otros'
  ]

  // Cargar productos del usuario
  useEffect(() => {
    if (user) {
      inicializarUsuario()
    }
  }, [user])

  const inicializarUsuario = async () => {
    try {
      // Buscar usuario existente
      let { data: usuario, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      // Si no existe, crear usuario
      if (!usuario) {
        const { data: nuevoUsuario, error: errorCreacion } = await supabase
          .from('users')
          .insert([{
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            nombre: user.firstName || '',
            apellido: user.lastName || '',
            rol: 'cliente'
          }])
          .select('id')
          .single()

        if (errorCreacion) throw errorCreacion
        usuario = nuevoUsuario
        console.log('✅ Usuario creado:', usuario)
      }

      setUsuarioDbId(usuario.id)
      cargarMisProductos(usuario.id)
    } catch (error) {
      console.error('❌ Error inicializando usuario:', error)
      setError(error.message)
      toast.error('Error de autenticación: ' + error.message)
      setLoading(false)
    }
  }

  const cargarMisProductos = async (userId = usuarioDbId) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Cargando mis productos para usuario ID:', userId)
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('usuario_id', userId)
        .order('id', { ascending: true })

      if (error) throw error
      
      console.log('📦 Mis productos:', data)
      setProductos(data || [])
      
      if (data && data.length > 0) {
        toast.success(`✅ ${data.length} productos cargados`)
      } else {
        toast('No tienes productos registrados')
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      setError(error.message)
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar selección de imagen
  const handleImagenChange = (e) => {
    const archivo = e.target.files[0]
    
    if (!archivo) return
    
    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      toast.error('Por favor selecciona solo archivos de imagen')
      return
    }
    
    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }
    
    setArchivoImagen(archivo)
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagenPreview(e.target.result)
    }
    reader.readAsDataURL(archivo)
  }

  // Convertir imagen a base64 para guardar en DB
  const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(archivo)
    })
  }

  // Crear nuevo producto
  const crearProducto = async (e) => {
    e.preventDefault()
    
    try {
      let imagen_url = formData.imagen_url
      
      // Convertir imagen a base64 si se seleccionó una
      if (archivoImagen) {
        imagen_url = await convertirImagenABase64(archivoImagen)
      }
      
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        stock: parseInt(formData.stock) || 0,
        usuario_id: usuarioDbId,
        imagen_url: imagen_url
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([productoData])
        .select()

      if (error) throw error

      toast.success('✅ Producto creado exitosamente')
      setShowModal(false)
      resetForm()
      cargarMisProductos()
    } catch (error) {
      console.error('Error creando producto:', error)
      toast.error('Error al crear producto: ' + error.message)
    }
  }

  // Actualizar producto existente
  const actualizarProducto = async (e) => {
    e.preventDefault()
    
    try {
      let imagen_url = formData.imagen_url
      
      // Si se seleccionó una nueva imagen, convertirla a base64
      if (archivoImagen) {
        imagen_url = await convertirImagenABase64(archivoImagen)
      }
      
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        stock: parseInt(formData.stock) || 0,
        imagen_url: imagen_url
      }

      const { error } = await supabase
        .from('productos')
        .update(productoData)
        .eq('id', editingProducto.id)

      if (error) throw error

      toast.success('✅ Producto actualizado exitosamente')
      setShowModal(false)
      setEditingProducto(null)
      resetForm()
      cargarMisProductos()
    } catch (error) {
      console.error('Error actualizando producto:', error)
      toast.error('Error al actualizar producto: ' + error.message)
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('✅ Producto eliminado exitosamente')
      cargarMisProductos()
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar producto: ' + error.message)
    }
  }

  // Abrir modal para editar
  const abrirEdicion = (producto) => {
    setEditingProducto(producto)
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio?.toString() || '',
      ubicacion: producto.ubicacion || '',
      categoria: producto.categoria || '',
      proveedor: producto.proveedor || '',
      stock: producto.stock?.toString() || '',
      imagen_url: producto.imagen_url || null
    })
    // Si existe imagen_url, mostrarla como preview
    setImagenPreview(producto.imagen_url || null)
    setArchivoImagen(null)
    setShowModal(true)
  }

  // Abrir modal para crear
  const abrirCreacion = () => {
    setEditingProducto(null)
    resetForm()
    setShowModal(true)
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      ubicacion: '',
      categoria: '',
      proveedor: '',
      stock: '',
      imagen_url: null
    })
    setImagenPreview(null)
    setArchivoImagen(null)
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
                <p className="mt-4 text-lg text-gray-600">Cargando mis productos...</p>
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
                Mis Productos
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona tu catálogo personal de productos agrícolas
              </p>
            </div>
            <button
              onClick={abrirCreacion}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              + Nuevo Producto
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

        {/* Grid de productos */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Imagen - Proporción fija como YouTube */}
                <div className="relative w-full h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                  <img
                    src={producto.imagen_url || 'https://via.placeholder.com/320x180?text=Sin+Imagen'}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '16/9' }}
                  />
                  {/* Overlay con acciones */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => abrirEdicion(producto)}
                      className="bg-black/70 hover:bg-blue-600 text-white p-1.5 rounded-full text-xs transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full text-xs transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Título y precio */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 min-h-[3.5rem]">
                      {producto.nombre}
                    </h3>
                    <div className="text-2xl font-bold text-green-600">
                      ${producto.precio ? Number(producto.precio).toLocaleString() : '0'}
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {producto.descripcion || 'Sin descripción'}
                  </p>

                  {/* Detalles en chips */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📍 {producto.ubicacion || 'Sin ubicación'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        🏷️ {producto.categoria || 'Sin categoría'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>📦 Stock: {producto.stock || 0}</span>
                      <span>🏢 {producto.proveedor || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Botones de acción principales */}
                  <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => abrirEdicion(producto)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No tienes productos registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primer producto para comenzar a vender
            </p>
            <button
              onClick={abrirCreacion}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              + Crear mi primer producto
            </button>
          </div>
        )}

        {/* Modal para crear/editar producto */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={editingProducto ? actualizarProducto : crearProducto}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Aceite de Girasol Premium"
                      />
                    </div>

                    {/* Precio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio *
                      </label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                    </div>

                    {/* Ubicación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Santiago, Chile"
                      />
                    </div>

                    {/* Proveedor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor
                      </label>
                      <input
                        type="text"
                        name="proveedor"
                        value={formData.proveedor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: AgroSur Ltda."
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe tu producto..."
                    />
                  </div>

                  {/* Subir imagen */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen del Producto
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                    </p>
                    
                    {/* Preview de la imagen */}
                    {imagenPreview && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vista Previa:
                        </label>
                        <div className="w-48 h-32 border border-gray-300 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={imagenPreview}
                            alt="Vista previa"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      {editingProducto ? 'Actualizar' : 'Crear'} Producto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  )
}