'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function TransportesPage() {
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Transportes estáticos
  const transportes = [
    {
      id: 1,
      nombre: 'Transporte de Aceite de Girasol',
      descripcion: 'Envío de 200 litros de aceite de girasol desde Mendoza a Santiago.',
      precio: 120000,
      origen: 'Mendoza, Argentina',
      destino: 'Santiago, Chile',
      tipo: 'liquidos',
      capacidad: '200 litros',
      tiempo_estimado: '5-7 días',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Transporte+Aceite',
      transportista: 'LogiSur Transportes',
      vehiculo: 'Camión cisterna especializado',
      fecha_salida: '2025-09-20'
    },
    {
      id: 2,
      nombre: 'Carga de Trigo',
      descripcion: 'Transporte de 3 toneladas de trigo desde Buenos Aires a São Paulo.',
      precio: 150000,
      origen: 'Buenos Aires, Argentina',
      destino: 'São Paulo, Brasil',
      tipo: 'cereales',
      capacidad: '3 toneladas',
      tiempo_estimado: '10-12 días',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Transporte+Trigo',
      transportista: 'Mercosur Logistics',
      vehiculo: 'Camión granelero',
      fecha_salida: '2025-09-25'
    },
    {
      id: 3,
      nombre: 'Envío de Cereales Mixtos',
      descripcion: 'Envío de 500kg de cereales variados desde Concepción a Lima.',
      precio: 80000,
      origen: 'Concepción, Chile',
      destino: 'Lima, Perú',
      tipo: 'cereales',
      capacidad: '500 kg',
      tiempo_estimado: '7-9 días',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Envio+Cereales',
      transportista: 'Pacífico Express',
      vehiculo: 'Camión de carga seca',
      fecha_salida: '2025-09-18'
    },
    {
      id: 4,
      nombre: 'Transporte Refrigerado',
      descripcion: 'Envío refrigerado de productos frescos desde Valparaíso a Guayaquil.',
      precio: 200000,
      origen: 'Valparaíso, Chile',
      destino: 'Guayaquil, Ecuador',
      tipo: 'refrigerado',
      capacidad: '2 toneladas',
      tiempo_estimado: '8-10 días',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Transporte+Refrigerado',
      transportista: 'ColdChain Logistics',
      vehiculo: 'Camión refrigerado',
      fecha_salida: '2025-09-22'
    },
    {
      id: 5,
      nombre: 'Carga de Quinoa',
      descripcion: 'Transporte especializado de quinoa orgánica desde Bolivia a Colombia.',
      precio: 180000,
      origen: 'La Paz, Bolivia',
      destino: 'Bogotá, Colombia',
      tipo: 'cereales',
      capacidad: '1.5 toneladas',
      tiempo_estimado: '12-15 días',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Transporte+Quinoa',
      transportista: 'Andean Cargo',
      vehiculo: 'Camión especializado',
      fecha_salida: '2025-09-28'
    },
    {
      id: 6,
      nombre: 'Envío Marítimo',
      descripcion: 'Transporte marítimo de contenedor completo hacia Asia.',
      precio: 500000,
      origen: 'Valparaíso, Chile',
      destino: 'Shanghai, China',
      tipo: 'maritimo',
      capacidad: '20 pies (TEU)',
      tiempo_estimado: '25-30 días',
      disponible: true,
      imagen: 'https://via.placeholder.com/300x200?text=Envio+Maritimo',
      transportista: 'Pacific Shipping Lines',
      vehiculo: 'Buque carguero',
      fecha_salida: '2025-10-05'
    }
  ]

  const handleSolicitar = (transporte) => {
    alert(`Solicitud enviada para ${transporte.nombre}`)
  }

  const transportesFiltrados = transportes.filter(transporte => {
    const matchTipo = filtroTipo === 'todos' || transporte.tipo === filtroTipo
    const matchSearch = transporte.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transporte.destino.toLowerCase().includes(searchTerm.toLowerCase())
    return matchTipo && matchSearch
  })

  const tipos = ['todos', 'liquidos', 'cereales', 'refrigerado', 'maritimo']

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Servicios de Transporte
            </h1>
            <p className="text-gray-600 text-lg">
              Encuentra el servicio de transporte perfecto para tus productos agrícolas
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar transportes por origen, destino o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por tipo */}
            <div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {tipos.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
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

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {transporte.descripcion}
                  </p>

                  {/* Información de ruta */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-800">Origen</div>
                        <div className="text-blue-600">{transporte.origen}</div>
                      </div>
                      <div className="text-blue-400">→</div>
                      <div className="text-center">
                        <div className="font-medium text-blue-800">Destino</div>
                        <div className="text-blue-600">{transporte.destino}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacidad:</span>
                      <span className="font-medium">{transporte.capacidad}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiempo estimado:</span>
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
                      <span className="font-medium">{formatearFecha(transporte.fecha_salida)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${transporte.precio.toLocaleString()}
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
          {transportesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚛</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron transportes
              </h3>
              <p className="text-gray-500">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-12 bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              ¿Necesitas un transporte personalizado?
            </h2>
            <p className="text-green-700 mb-4">
              Si no encuentras el servicio que necesitas, podemos ayudarte a crear una solución personalizada
              para tu carga específica.
            </p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Solicitar Cotización Personalizada
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}