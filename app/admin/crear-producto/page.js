'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function CrearProducto() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    ubicacion: '',
    categoria: 'aceites',
    stock: '',
    proveedor: '',
    imagen: ''
  })

  const categorias = ['aceites', 'cereales', 'otros']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)

    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.precio || !formData.ubicacion) {
        toast.error('Por favor, completa todos los campos obligatorios')
        setCargando(false)
        return
      }

      // Preparar datos para insertar (SIN created_at manual)
      const productoData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: parseFloat(formData.precio),
        ubicacion: formData.ubicacion.trim(),
        categoria: formData.categoria,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        proveedor: formData.proveedor.trim() || null,
        imagen: formData.imagen.trim() || null,
        disponible: true
        // Eliminamos created_at - Supabase lo manejará automáticamente
      }

      console.log('Datos a insertar:', productoData)

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('productos')
        .insert([productoData])
        .select()

      if (error) {
        console.error('Error de Supabase:', error)
        toast.error(`Error al crear el producto: ${error.message}`)
        return
      }

      console.log('Producto creado:', data)
      toast.success('¡Producto creado exitosamente!')
      router.push('/admin')

    } catch (error) {
      console.error('Error general:', error)
      toast.error('Error inesperado al crear el producto')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        <p className="text-gray-600 mt-2">Completa la información del producto</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del producto */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Aceite de Girasol Premium"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción detallada del producto..."
          />
        </div>

        {/* Precio y Stock en una fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
              Precio (CLP) *
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000"
              min="0"
              step="100"
              required
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Disponible
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="0"
            />
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación *
          </label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Santiago, Chile"
            required
          />
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div>
          <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-2">
            Proveedor
          </label>
          <input
            type="text"
            id="proveedor"
            name="proveedor"
            value={formData.proveedor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del proveedor"
          />
        </div>

        {/* URL de imagen */}
        <div>
          <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-2">
            URL de Imagen
          </label>
          <input
            type="url"
            id="imagen"
            name="imagen"
            value={formData.imagen}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si no proporcionas una imagen, se usará una imagen por defecto
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            disabled={cargando}
          >
            {cargando ? 'Creando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  )
}