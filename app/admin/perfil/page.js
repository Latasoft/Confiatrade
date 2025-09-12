'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabaseClient'
import { useUser } from '@clerk/nextjs'

export default function PerfilAdminPage() {
  const { user } = useUser()
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
  })

  const supabase = useSupabase()

  // 📌 Cargar perfil desde Supabase
  const fetchPerfil = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Error al cargar perfil:', error)
    } else {
      setPerfil(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    fetchPerfil()
  }, [user, supabase])

  // 📌 Abrir modal
  const abrirEditar = () => {
    setFormData({
      nombre: perfil?.nombre || '',
      email: perfil?.email || '',
      telefono: perfil?.telefono || '',
      rol: perfil?.rol || '',
    })
    setModalAbierto(true)
  }

  // 📌 Guardar cambios
  const guardarPerfil = async () => {
    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        rol: formData.rol,
      })
      .eq('id', user.id)

    if (error) {
      console.error('❌ Error al actualizar perfil:', error)
      alert('No se pudo actualizar el perfil')
    } else {
      alert('✅ Perfil actualizado')
      setModalAbierto(false)
      fetchPerfil()
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

      {cargando ? (
        <p className="text-center">Cargando perfil...</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.imageUrl || '/default-avatar.png'}
              alt="avatar"
              className="w-20 h-20 rounded-full border"
            />
            <div>
              <h2 className="text-2xl font-semibold">
                {perfil?.nombre || 'No definido'}
              </h2>
              <p className="text-gray-500">{perfil?.rol || 'Sin rol'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p>
              <span className="font-semibold">📧 Email:</span>{' '}
              {perfil?.email || 'No definido'}
            </p>
            <p>
              <span className="font-semibold">📱 Teléfono:</span>{' '}
              {perfil?.telefono || 'No definido'}
            </p>
            <p>
              <span className="font-semibold">🛡️ Rol:</span>{' '}
              {perfil?.rol || 'No definido'}
            </p>
            <p>
              <span className="font-semibold">📅 Creado:</span>{' '}
              {perfil?.created_at
                ? new Date(perfil.created_at).toLocaleDateString()
                : 'No definido'}
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={abrirEditar}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ✏️ Editar Perfil
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full mb-3 border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full mb-3 border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-full mb-3 border p-2 rounded"
            />
            <select
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value })
              }
              className="w-full mb-3 border p-2 rounded"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPerfil}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
