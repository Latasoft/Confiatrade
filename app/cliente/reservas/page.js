// app/cliente/reservas/page.js
// 📌 Página de "Mis Reservas" para el Cliente en ConfiaTrade.
// Aquí el cliente podrá ver todas las reservas que tiene en la plataforma.
// Más adelante se conectará con Supabase para traer las reservas filtradas por user_id.

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MisReservas() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)

  // 🔹 Trae las reservas del cliente (placeholder por ahora)
  useEffect(() => {
    const fetchReservas = async () => {
      // ⚠️ Esto es solo demostrativo.
      // Luego filtraremos por user_id del cliente logueado.
      const { data, error } = await supabase
        .from('experiencias')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('❌ Error al obtener reservas:', error)
      } else {
        setReservas(data)
      }

      setCargando(false)
    }

    fetchReservas()
  }, [])

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Mis Reservas</h1>

      {/* Estado de carga */}
      {cargando ? (
        <p className="text-center">Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p className="text-center text-gray-500">No tienes reservas aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map((reserva) => (
            <div
              key={reserva.id}
              className="border p-4 rounded-lg shadow bg-white hover:shadow-lg transition"
            >
              {reserva.imagen && (
                <img
                  src={reserva.imagen}
                  alt={reserva.titulo}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-lg font-semibold">{reserva.titulo}</h2>
              <p className="text-sm text-gray-600">{reserva.descripcion}</p>
              <p className="mt-2 font-bold text-green-600">${reserva.precio}</p>
              <p className="text-sm text-gray-500 mt-1">
                Ubicación: {reserva.ubicacion}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
