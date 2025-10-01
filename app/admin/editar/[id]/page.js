'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditarExperiencia() {
  const params = useParams()
  const router = useRouter()
  
  // Obtener ID de manera segura
  const id = params?.id ? String(params.id) : null

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [precio, setPrecio] = useState('')
  const [estado, setEstado] = useState('publicado')
  const [imagen, setImagen] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Validar que tenemos un ID válido antes de hacer la consulta
      if (!id) {
        setMensaje('❌ ID de experiencia inválido')
        return
      }

      const { data, error } = await supabase
        .from('experiencias')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (!error && data) {
        setTitulo(data.titulo)
        setDescripcion(data.descripcion)
        setUbicacion(data.ubicacion)
        setPrecio(data.precio)
        setEstado(data.estado || 'publicado')
        setImagen(data.imagen || '')
      } else if (error) {
        console.error('Error al cargar experiencia:', error)
        setMensaje('❌ Error al cargar la experiencia')
      }
    }

    fetchData()
  }, [id])

  const manejarSubidaImagen = async (e) => {
    try {
      setSubiendo(true)
      const archivo = e.target.files[0]
      if (!archivo) return

      const nombreArchivo = `${Date.now()}-${archivo.name}`

      const { error: uploadError } = await supabase.storage
        .from('experiencias')
        .upload(nombreArchivo, archivo)

      if (uploadError) return

      const { data } = supabase.storage.from('experiencias').getPublicUrl(nombreArchivo)
      setImagen(data.publicUrl)
    } catch (err) {
      console.error(err)
    } finally {
      setSubiendo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase
      .from('experiencias')
      .update({
        titulo,
        descripcion,
        ubicacion,
        precio: Number(precio),
        estado,
        imagen,
      })
      .eq('id', Number(id))

    if (!error) {
      setMensaje('✅ Experiencia actualizada correctamente.')
      setTimeout(() => router.push('/admin'), 1500)
    } else {
      setMensaje('❌ No se pudo actualizar la experiencia.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 
                    bg-gradient-to-br from-blue-100 via-white to-green-100">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
          ✏️ Editar Experiencia
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Título:</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Descripción:</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-[120px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Ubicación:</label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Precio:</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Estado:</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="publicado">Publicado</option>
              <option value="borrador">Borrador</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Imagen:</label>
            <input
              type="file"
              accept="image/*"
              onChange={manejarSubidaImagen}
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
            {imagen && (
              <div className="mt-4">
                <img
                  src={imagen}
                  alt="Vista previa"
                  className="w-full max-h-[400px] object-contain rounded-lg border shadow"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow"
          >
            💾 Guardar Cambios
          </button>
        </form>

        {mensaje && (
          <p
            className={`mt-6 text-center font-semibold ${
              mensaje.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </main>
  )
}
