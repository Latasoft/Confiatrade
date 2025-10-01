'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'

export default function Experiencias() {
  const [experiencias, setExperiencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const { user } = useUser() // 🔹 Usuario logueado de Clerk

  // Obtener experiencias desde Supabase al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('experiencias')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('❌ Error al obtener experiencias:', error)
      } else {
        setExperiencias(data)
      }

      setCargando(false)
    }

    fetchData()
  }, [])

  // 🔹 Función para reservar una experiencia
  const handleReserva = async (experienciaId) => {
    if (!user) {
      setMensaje('❌ Debes iniciar sesión para reservar.')
      return
    }

    const { id: clerkId } = user

    const { error } = await supabase.from('reservas').insert([
      {
        experiencia_id: experienciaId,
        user_id: clerkId, // Guardamos el ID de Clerk
        estado: 'pendiente'
      }
    ])

    if (error) {
      console.error('❌ Error al crear reserva:', error)
      setMensaje('❌ No se pudo crear la reserva.')
    } else {
      setMensaje('✅ Reserva creada con éxito. Puedes verla en "Mis Reservas".')
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Explorar Experiencias</h1>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div className="mb-6 text-center font-semibold">
          {mensaje}
        </div>
      )}

      {/* Manejamos el estado de carga */}
      {cargando ? (
        <div className="text-center text-xl">Cargando experiencias...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Si no hay experiencias */}
          {experiencias.length === 0 ? (
            <div className="col-span-full text-center text-xl text-gray-500">
              No hay experiencias disponibles.
            </div>
          ) : (
            experiencias.map((exp) => (
              <div
                key={exp.id}
                className="border-2 border-gray-300 p-4 rounded-lg shadow-lg bg-white hover:shadow-xl transition-all"
              >
                {/* Imagen */}
                {exp.imagen && (
                  <img
                    src={exp.imagen}
                    alt={exp.titulo}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}

                {/* Información de la experiencia */}
                <h2 className="text-xl font-semibold text-gray-800">{exp.titulo}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Ubicación:</strong> {exp.ubicacion}
                </p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  ${exp.precio}
                </p>
                <p className="text-gray-700 mt-2">{exp.descripcion}</p>

                {/* Botón para reservar */}
                <div className="mt-4">
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() => handleReserva(exp.id)}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  )
}
