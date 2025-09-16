'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/ui/Footer'

export default function PedidosPage() {
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // Datos estáticos de pedidos
  const pedidos = [
    {
      id: 1,
      numero_pedido: 'PED-2025-001',
      producto_nombre: 'Aceite de Girasol',
      cantidad: 200,
      unidad: 'litros',
      precio_total: 120000,
      estado: 'pendiente',
      fecha_pedido: '2025-09-10',
      fecha_entrega_estimada: '2025-09-20',
      proveedor: 'AgroMendoza S.A.',
      direccion_entrega: 'Santiago, Chile',
      notas: 'Entrega en horario de oficina',
      cliente: 'Juan Pérez'
    },
    {
      id: 2,
      numero_pedido: 'PED-2025-002',
      producto_nombre: 'Trigo Premium',
      cantidad: 3,
      unidad: 'toneladas',
      precio_total: 150000,
      estado: 'confirmado',
      fecha_pedido: '2025-09-08',
      fecha_entrega_estimada: '2025-09-18',
      proveedor: 'Cereales del Sur',
      direccion_entrega: 'Valparaíso, Chile',
      notas: 'Requiere almacenamiento especial',
      cliente: 'María González'
    },
    {
      id: 3,
      numero_pedido: 'PED-2025-003',
      producto_nombre: 'Cereales Mixtos',
      cantidad: 500,
      unidad: 'kg',
      precio_total: 80000,
      estado: 'enviado',
      fecha_pedido: '2025-09-05',
      fecha_entrega_estimada: '2025-09-15',
      proveedor: 'ChileGranos Ltd.',
      direccion_entrega: 'Concepción, Chile',
      notas: 'Carga especial para exportación',
      cliente: 'Carlos López'
    }
  ]

  // Filtrar pedidos según el estado seleccionado
  const pedidosFiltrados = pedidos.filter(pedido => {
    return filtroEstado === 'todos' || pedido.estado === filtroEstado
  })

  // Calcular estadísticas
  const estadisticas = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    confirmados: pedidos.filter(p => p.estado === 'confirmado').length,
    enviados: pedidos.filter(p => p.estado === 'enviado').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    valor_total: pedidos.reduce((sum, p) => sum + p.precio_total, 0)
  }

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(precio)
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Gestión de Pedidos
            </h1>
            <p className="text-gray-600 text-lg">
              Visualiza y gestiona todos los pedidos de la plataforma
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
              <div className="text-sm text-blue-800">Total Pedidos</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
              <div className="text-sm text-yellow-800">Pendientes</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.confirmados}</div>
              <div className="text-sm text-blue-800">Confirmados</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.enviados}</div>
              <div className="text-sm text-purple-800">Enviados</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.entregados}</div>
              <div className="text-sm text-green-800">Entregados</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatearPrecio(estadisticas.valor_total)}
              </div>
              <div className="text-sm text-green-800">Valor Total</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmado">Confirmados</option>
              <option value="enviado">Enviados</option>
              <option value="entregado">Entregados</option>
            </select>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-4 mb-8">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 mr-3">
                        {pedido.numero_pedido}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Producto:</span> {pedido.producto_nombre}
                      </div>
                      <div>
                        <span className="font-medium">Cantidad:</span> {pedido.cantidad} {pedido.unidad}
                      </div>
                      <div>
                        <span className="font-medium">Proveedor:</span> {pedido.proveedor}
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span> {pedido.cliente}
                      </div>
                      <div>
                        <span className="font-medium">Entrega:</span> {pedido.direccion_entrega}
                      </div>
                      <div>
                        <span className="font-medium">Fecha Pedido:</span> {formatearFecha(pedido.fecha_pedido)}
                      </div>
                    </div>
                    
                    {pedido.notas && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Notas:</span> {pedido.notas}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6 text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatearPrecio(pedido.precio_total)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.fecha_entrega_estimada && 
                        `Entrega: ${formatearFecha(pedido.fecha_entrega_estimada)}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje si no hay pedidos */}
          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron pedidos
              </h3>
              <p className="text-gray-500">
                No hay pedidos que coincidan con el filtro seleccionado
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-green-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Gestión Completa de Pedidos
            </h2>
            <p className="text-green-700 mb-4">
              Aquí puedes visualizar todos los pedidos realizados en la plataforma, desde productos agrícolas 
              hasta servicios de transporte. Mantén un control completo del estado de cada pedido.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-green-800 font-semibold">📦 Productos</div>
                <div className="text-green-600 text-sm">Aceites, cereales, miel y más</div>
              </div>
              <div className="text-center">
                <div className="text-green-800 font-semibold">🚛 Transporte</div>
                <div className="text-green-600 text-sm">Logística nacional e internacional</div>
              </div>
              <div className="text-center">
                <div className="text-green-800 font-semibold">📊 Seguimiento</div>
                <div className="text-green-600 text-sm">Control en tiempo real</div>
              </div>
            </div>
          </div>
      </div>
      <Footer />
    </div>
  )
}