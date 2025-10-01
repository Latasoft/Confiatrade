'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CrearExperiencia() {
  // Estados para los campos del formulario
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [precio, setPrecio] = useState('')
  const [imagen, setImagen] = useState(null) // archivo tipo File
  const [mensaje, setMensaje] = useState('') // mensaje de éxito o error

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar campos obligatorios
    if (!titulo || !descripcion || !ubicacion || !precio) {
      setMensaje('❌ Todos los campos son obligatorios')
      return
    }

    let imagenUrl = '' // Aquí guardaremos la URL pública

    // Subir imagen si se seleccionó
    if (imagen) {
      const nombreArchivo = `imagenes/${Date.now()}_${imagen.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('experiencias')
        .upload(nombreArchivo, imagen)

      if (uploadError) {
        console.error('❌ Error al subir imagen:', uploadError)
        setMensaje('❌ Error al subir la imagen')
        return
      }

      // Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase
        .storage
        .from('experiencias')
        .getPublicUrl(uploadData.path)

      imagenUrl = publicUrlData.publicUrl
    }

    // Insertar datos en la tabla "experiencias"
    const { error: insertError } = await supabase.from('experiencias').insert([
      {
        titulo,
        descripcion,
        ubicacion,
        precio: Number(precio), // 👈 PostgreSQL espera valor numérico
        imagen: imagenUrl,       // 👈 Usamos el nuevo nombre de campo correcto
      },
    ])

    if (insertError) {
      console.error('❌ Error al insertar en la BDD:', insertError)
      setMensaje('❌ Ocurrió un error al crear la experiencia')
    } else {
      setMensaje('✅ ¡Experiencia creada exitosamente!')

      // Limpiar el formulario
      setTitulo('')
      setDescripcion('')
      setUbicacion('')
      setPrecio('')
      setImagen(null)
    }
  }

  // Función para actualizar la imagen seleccionada
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagen(file)
    }
  }

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Crear Nueva Experiencia</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="block w-full border p-2 rounded"
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          className="block w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Ubicación"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          required
          className="block w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
          className="block w-full border p-2 rounded"
        />
        
        {/* Mejora del campo de imagen */}
        <div className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center">
          <label className="cursor-pointer">
            <span className="block text-lg font-semibold mb-2">Selecciona una Imagen</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="py-4 px-6 bg-gray-100 rounded-md border border-dashed">
              {imagen ? (
                <div className="text-sm text-gray-700">{imagen.name}</div>
              ) : (
                <p className="text-gray-500">Ningún archivo seleccionado</p>
              )}
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear Experiencia
        </button>
      </form>

      {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
    </main>
  )
}
