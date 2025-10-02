'use client'

import { useState, useEffect } from 'react'
import { transportesService } from '@/lib/transportesService'
import { toast } from 'react-hot-toast'
import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'

export default function TransportesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [transportes, setTransportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar transportes desde Supabase
  useEffect(() => {
    cargarTransportes()
  }, [])

  const cargarTransportes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Iniciando carga de transportes...')
      const data = await transportesService.getTransportes()
      console.log('📦 Datos recibidos:', data)
      
      setTransportes(data)
      
      if (data && data.length === 0) {
        toast.info('No hay transportes disponibles')
      } else if (data && data.length > 0) {
        toast.success(`✅ ${data.length} transportes cargados desde Supabase`)
        console.log('✅ Transportes establecidos en estado:', data)
      }
    } catch (error) {
      console.error('❌ Error cargando transportes:', error)
      setError(error.message)
      toast.error('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Formatear datos de Supabase
  const formatearTransporte = (transporte) => {
    return {
      id: transporte.id,
      nombre: transporte.nombre || 'Transporte',
      descripcion: transporte.descripcion || 'Sin descripción',
      precio: transporte.precio || 0,
      origen: transporte.origen || 'Origen no especificado',
      destino: transporte.destino || 'Destino no especificado',
      capacidad: `${transporte.capacidad_total || 0} ${transporte.unidad_capacidad || 'kg'}`,
      tiempo_estimado: transporte.tiempo_estimado || 'No especificado',
      disponible: transporte.estado === 'disponible',
      imagen: transporte.imagen_url || 'https://via.placeholder.com/300x200?text=Transporte',
      transportista: transporte.transportista || 'Transportista',
      vehiculo: transporte.vehiculo || 'Vehículo no especificado',
      fecha_salida: transporte.fecha_salida ? new Date(transporte.fecha_salida).toLocaleDateString() : 'Por definir'
    }
  }

  const transportesFormateados = transportes.map(formatearTransporte)

  // Filtrar transportes por búsqueda
  const transportesFiltrados = transportesFormateados.filter(transporte => {
    const matchSearch = transporte.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.transportista.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  const handleSolicitar = async (transporte) => {
    try {
      console.log('🚛 Solicitando transporte:', transporte)
      toast.success(`Solicitud enviada para ${transporte.nombre}`)
    } catch (error) {
      console.error('Error enviando solicitud:', error)
      toast.error('Error al enviar la solicitud')
    }
  }

  const refrescarDatos = () => {
    cargarTransportes()
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavbarCliente />
        <div className="flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Cargando transportes desde Supabase...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarCliente />
      <div className="flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Servicios de Transporte
              </h1>
              <p className="text-gray-600 text-lg">
                Encuentra el servicio de transporte perfecto para tus productos agrícolas
              </p>
            </div>
            <button
              onClick={refrescarDatos}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔄 Refrescar
            </button>
          </div>
          
          {/* Estado de conexión */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">❌ Error de conexión</p>
              <p className="text-sm">No se pudo conectar con la base de datos: {error}</p>
            </div>
          )}
          
          {!error && transportes.length > 0 && (
            <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
              <p className="font-medium">✅ Conectado a Supabase</p>
              <p className="text-sm">Mostrando {transportes.length} transportes desde la base de datos</p>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Buscar Transportes</h2>
          
          <div>
            <input
              type="text"
              placeholder="Buscar por origen, destino, transportista..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de transportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {transportesFiltrados.map((transporte) => (
            <div
              key={transporte.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Imagen */}
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={transporte.imagen}
                  alt={transporte.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {transporte.nombre}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transporte.disponible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transporte.disponible ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {transporte.descripcion}
                </p>

                {/* Detalles */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Origen:</span>
                    <span className="font-medium">{transporte.origen}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Destino:</span>
                    <span className="font-medium">{transporte.destino}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-medium">{transporte.capacidad}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiempo:</span>
                    <span className="font-medium">{transporte.tiempo_estimado}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transportista:</span>
                    <span className="font-medium">{transporte.transportista}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vehículo:</span>
                    <span className="font-medium">{transporte.vehiculo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha salida:</span>
                    <span className="font-medium">{transporte.fecha_salida}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${transporte.precio?.toLocaleString() || 'Consultar'}
                  </div>
                  <button
                    onClick={() => handleSolicitar(transporte)}
                    disabled={!transporte.disponible}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      transporte.disponible
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {transporte.disponible ? 'Solicitar' : 'No Disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay transportes */}
        {!loading && transportesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚛</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {error ? 'Error de conexión' : 'No se encontraron transportes'}
            </h3>
            <p className="text-gray-500">
              {error ? error : 'Intenta ajustar tu búsqueda'}
            </p>
            {error && (
              <div className="mt-4">
                <button
                  onClick={refrescarDatos}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Reintentar Conexión
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  )
}