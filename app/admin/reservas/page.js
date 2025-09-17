'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ReservasAdminPage() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)

  // 🔹 Cargar todas las reservas
  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        id,
        estado,
        cantidad,
        monto,
        created_at,
        experiencias ( titulo, ubicacion, precio ),
        profiles ( email, nombre )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al cargar reservas:', error)
    } else {
      setReservas(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  // 🔹 Cambiar estado de la reserva
  const actualizarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('reservas')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al actualizar reserva:', error)
      alert('❌ No se pudo actualizar la reserva.')
    } else {
      alert(`✅ Reserva marcada como ${nuevoEstado}`)
      fetchReservas()
    }
  }

  // 🔹 Render
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Reservas de Clientes
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {cargando ? (
          <p className="text-center py-6">Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            No hay reservas registradas.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Email</th>
                <th className="p-3">Experiencia</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva, index) => (
                <tr
                  key={reserva.id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="p-3">{reserva.id}</td>
                  <td className="p-3 font-medium">{reserva.profiles?.nombre || 'Sin nombre'}</td>
                  <td className="p-3">{reserva.profiles?.email}</td>
                  <td className="p-3">{reserva.experiencias?.titulo}</td>
                  <td className="p-3">{reserva.experiencias?.ubicacion}</td>
                  <td className="p-3 text-green-700 font-semibold">
                    ${reserva.monto || reserva.experiencias?.precio}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs uppercase tracking-wide ${
                        reserva.estado === 'pendiente'
                          ? 'bg-yellow-500'
                          : reserva.estado === 'confirmada'
                          ? 'bg-green-600'
                          : 'bg-red-600'
                      }`}
                    >
                      {reserva.estado}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(reserva.created_at).toLocaleDateString()} <br />
                    <span className="text-xs">
                      {new Date(reserva.created_at).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => actualizarEstado(reserva.id, 'confirmada')}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      ✅ Aceptar
                    </button>
                    <button
                      onClick={() => actualizarEstado(reserva.id, 'rechazada')}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      ❌ Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
