'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function PerfilPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  })

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Simular carga de perfil desde la base de datos
      setTimeout(() => {
        setProfile({
          email: user.primaryEmailAddress?.emailAddress || '',
          nombre: user.firstName || '',
          apellido: user.lastName || '',
          telefono: user.phoneNumbers?.[0]?.phoneNumber || '',
          direccion: 'Av. Principal 123',
          ciudad: 'Ciudad',
          codigoPostal: '12345'
        })
        setFormData({
          telefono: user.phoneNumbers?.[0]?.phoneNumber || '',
          direccion: 'Av. Principal 123',
          ciudad: 'Ciudad',
          codigoPostal: '12345'
        })
        setLoading(false)
      }, 1000)
    }
  }, [isLoaded, isSignedIn, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      // Aquí iría la lógica para guardar en la base de datos
      setProfile(prev => ({
        ...prev,
        ...formData
      }))
      setEditing(false)
      alert('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      alert('Error al actualizar el perfil')
    }
  }
  

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
                <p className="text-gray-600">Gestiona tu información personal</p>
              </div>
            </div>
          </div>

          {/* Información del Perfil */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Información Personal</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={profile?.nombre || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={profile?.apellido || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={editing ? formData.telefono : profile?.telefono || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    editing ? 'bg-white' : 'bg-gray-50 text-gray-600'
                  }`}
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={editing ? formData.direccion : profile?.direccion || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    editing ? 'bg-white' : 'bg-gray-50 text-gray-600'
                  }`}
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={editing ? formData.ciudad : profile?.ciudad || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    editing ? 'bg-white' : 'bg-gray-50 text-gray-600'
                  }`}
                />
              </div>

              {/* Código Postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={editing ? formData.codigoPostal : profile?.codigoPostal || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    editing ? 'bg-white' : 'bg-gray-50 text-gray-600'
                  }`}
                />
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>

          {/* Estadísticas del Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
              <div className="text-gray-600">Pedidos Realizados</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600">Transportes Enviados</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">4.8</div>
              <div className="text-gray-600">Calificación Promedio</div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  📦
                </div>
                <div>
                  <p className="font-medium text-gray-800">Pedido #1234 completado</p>
                  <p className="text-sm text-gray-600">Hace 2 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                  🚚
                </div>
                <div>
                  <p className="font-medium text-gray-800">Transporte enviado a Lima</p>
                  <p className="text-sm text-gray-600">Hace 5 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                  ⭐
                </div>
                <div>
                  <p className="font-medium text-gray-800">Recibiste una calificación de 5 estrellas</p>
                  <p className="text-sm text-gray-600">Hace 1 semana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}