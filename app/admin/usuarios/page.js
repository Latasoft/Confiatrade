'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient';

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos') // nuevo: para filtrar por estado

  //Estados para modal de crear/editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'cliente',
    estado: 'activo', // nuevo: estado de validación
  })

  //Obtener usuarios
  const fetchUsuarios = async () => {
    let query = supabase
      .from('users')
      .select('*')
      .order('fecha_registro', { ascending: false })
    
    // Filtrar por estado si no es 'todos'
    if (filtro !== 'todos') {
      query = query.eq('estado', filtro)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error al cargar usuarios:', error)
    } else {
      setUsuarios(data)
    }
    setCargando(false)
  }

  // Aprobar usuario
  const aprobarUsuario = async (id) => {
    const { error } = await supabase
      .from('users')
      .update({ estado: 'activo' })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al aprobar usuario:', error)
      alert('No se pudo aprobar el usuario')
    } else {
      alert('✅ Usuario aprobado correctamente')
      fetchUsuarios()
    }
  }

  // 📌 Rechazar usuario
  const rechazarUsuario = async (id) => {
    const { error } = await supabase
      .from('users')
      .update({ estado: 'inactivo' })
      .eq('id', id)

    if (error) {
      console.error('❌ Error al rechazar usuario:', error)
      alert('No se pudo rechazar el usuario')
    } else {
      alert('✅ Usuario rechazado')
      fetchUsuarios()
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  // 📌 Abrir modal para crear
  const abrirCrear = () => {
    setUsuarioEditando(null)
    setFormData({ nombre: '', email: '', rol: 'cliente' })
    setModalAbierto(true)
  }

  // 📌 Abrir modal para editar
  const abrirEditar = (usuario) => {
    setUsuarioEditando(usuario)
    setFormData({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      rol: usuario.rol || 'cliente',
    })
    setModalAbierto(true)
  }

  // 📌 Guardar (crear o editar)
  const guardarUsuario = async () => {
    if (!formData.email) {
      alert('El email es obligatorio')
      return
    }

    let error
    if (usuarioEditando) {
      // Editar
      const { error: updateError } = await supabase
        .from('users')
        .update({
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          estado: formData.estado,
        })
        .eq('id', usuarioEditando.id)
      error = updateError
    } else {
      // Crear
      const { error: insertError } = await supabase.from('users').insert([
        {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          estado: 'activo', // Nuevo usuario activo por defecto
          clerk_id: `manual_${Date.now()}`, // ID temporal para usuarios creados manualmente
        },
      ])
      error = insertError
    }

    if (error) {
      console.error('❌ Error al guardar usuario:', error)
      alert('No se pudo guardar el usuario')
    } else {
      alert('✅ Usuario guardado')
      setModalAbierto(false)
      fetchUsuarios()
    }
  }

  // 📌 Eliminar
  const eliminarUsuario = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return

    const { error } = await supabase.from('users').delete().eq('id', id)

    if (error) {
      console.error('❌ Error al eliminar usuario:', error)
      alert('No se pudo eliminar el usuario')
    } else {
      alert('✅ Usuario eliminado')
      fetchUsuarios()
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ➕ Crear usuario
        </button>
      </div>
      
      {/* Filtros de estado */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-3 py-1 rounded ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('pendiente')}
          className={`px-3 py-1 rounded ${filtro === 'pendiente' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltro('aprobado')}
          className={`px-3 py-1 rounded ${filtro === 'aprobado' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Aprobados
        </button>
        <button
          onClick={() => setFiltro('rechazado')}
          className={`px-3 py-1 rounded ${filtro === 'rechazado' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Rechazados
        </button>
      </div>

      {cargando ? (
        <p className="text-center">Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-center text-gray-500">No hay usuarios registrados.</p>
      ) : (
        <table className="w-full border-collapse shadow-lg bg-white">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Email</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 text-center">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.nombre}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 capitalize">{u.rol}</td>
                <td className="p-2">
                  <span className={
                    `px-2 py-1 rounded text-white ${
                      u.estado === 'aprobado' ? 'bg-green-500' : 
                      u.estado === 'rechazado' ? 'bg-red-500' : 
                      'bg-yellow-500'
                    }`
                  }>
                    {u.estado || 'pendiente'}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  {u.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => aprobarUsuario(u.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => rechazarUsuario(u.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✗ Rechazar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => abrirEditar(u)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => eliminarUsuario(u.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    🗑 Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {usuarioEditando ? 'Editar Usuario' : 'Crear Usuario'}
            </h2>
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

            <select
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value })
              }
              className="w-full mb-3 border p-2 rounded"
            >
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={guardarUsuario}
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
