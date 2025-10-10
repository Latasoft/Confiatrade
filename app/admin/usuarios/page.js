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
    <div className="container mx-auto p-6">
      {/* Header con glass effect */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ➕ Crear usuario
          </button>
        </div>
      </div>

      {/* Filtros con glass effect */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => setFiltro('todos')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'todos' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFiltro('pendiente')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'pendiente' 
                ? 'bg-orange-500 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFiltro('aprobado')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'aprobado' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Aprobados
          </button>
          <button 
            onClick={() => setFiltro('rechazado')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'rechazado' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Rechazados
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="text-gray-600 dark:text-gray-300">Cargando usuarios...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
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
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-center text-gray-900 dark:text-white">
                <td className="p-2 border-b border-gray-200 dark:border-gray-600">{u.id}</td>
                <td className="p-2 border-b border-gray-200 dark:border-gray-600">{u.nombre}</td>
                <td className="p-2 border-b border-gray-200 dark:border-gray-600">{u.email}</td>
                <td className="p-2 capitalize border-b border-gray-200 dark:border-gray-600">{u.rol}</td>
                <td className="p-2 border-b border-gray-200 dark:border-gray-600">
                  <span className={
                    `px-2 py-1 rounded text-white ${
                      u.estado === 'aprobado' ? 'bg-green-500' : 
                      u.estado === 'rechazado' ? 'bg-red-500' : 
                      'bg-orange-500'
                    }`
                  }>
                    {u.estado || 'pendiente'}
                  </span>
                </td>
                <td className="p-2 border-b border-gray-200 dark:border-gray-600">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2 justify-center border-b border-gray-200 dark:border-gray-600">
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
        </div>
      )}

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="glass p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
    </div>
  )
}
