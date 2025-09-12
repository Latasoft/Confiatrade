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
      tracking: 'TRK123456789',
      cliente: 'Carlos López'
    },
    {
      id: 4,
      numero_pedido: 'PED-2025-004',
      producto_nombre: 'Aceite de Oliva Extra Virgen',
      cantidad: 100,
      unidad: 'litros',
      precio_total: 200000,
      estado: 'entregado',
      fecha_pedido: '2025-08-28',
      fecha_entrega: '2025-09-05',
      proveedor: 'Olivos del Valle',
      direccion_entrega: 'La Serena, Chile',
      cliente: 'Ana Martínez'
    },
    {
      id: 5,
      numero_pedido: 'PED-2025-005',
      producto_nombre: 'Transporte de Quinoa',
      cantidad: 1.5,
      unidad: 'toneladas',
      precio_total: 180000,
      estado: 'confirmado',
      fecha_pedido: '2025-09-12',
      fecha_entrega_estimada: '2025-09-25',
      proveedor: 'Andean Cargo',
      direccion_entrega: 'Bogotá, Colombia',
      notas: 'Transporte especializado',
      cliente: 'Roberto Silva'
    },
    {
      id: 6,
      numero_pedido: 'PED-2025-006',
      producto_nombre: 'Envío Marítimo',
      cantidad: 1,
      unidad: 'contenedor',
      precio_total: 500000,
      estado: 'pendiente',
      fecha_pedido: '2025-09-11',
      fecha_entrega_estimada: '2025-10-15',
      proveedor: 'Pacific Shipping Lines',
      direccion_entrega: 'Shanghai, China',
      notas: 'Documentación aduanera incluida',
      cliente: 'Empresa Exports Ltd.'
    }
  ]

  const cancelarPedido = (pedidoId) => {
    alert(`Pedido #${pedidoId} ha sido cancelado`)
  }

  const pedidosFiltrados = pedidos.filter(pedido => {
    return filtroEstado === 'todos' || pedido.estado === filtroEstado
  })

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'enviado': 'bg-purple-100 text-purple-800',
      'entregado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Estadísticas
  const estadisticas = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    confirmados: pedidos.filter(p => p.estado === 'confirmado').length,
    enviados: pedidos.filter(p => p.estado === 'enviado').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    valor_total: pedidos.reduce((sum, p) => sum + p.precio_total, 0)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
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
                ${(estadisticas.valor_total / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-green-800">Valor Total</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Filtrar por estado:</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
            </div>
          </div>

          {/* Lista de pedidos */}
          <div className="space-y-6">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Header del pedido */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Pedido #{pedido.numero_pedido}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Cliente: {pedido.cliente} • Realizado el {formatearFecha(pedido.fecha_pedido)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido del pedido */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información del producto */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Información del Producto</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Producto:</span>
                          <span className="font-medium">{pedido.producto_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cantidad:</span>
                          <span className="font-medium">{pedido.cantidad} {pedido.unidad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Proveedor:</span>
                          <span className="font-medium">{pedido.proveedor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-green-600">${pedido.precio_total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información de entrega */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Información de Entrega</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dirección:</span>
                          <span className="font-medium">{pedido.direccion_entrega}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha estimada:</span>
                          <span className="font-medium">
                            {pedido.fecha_entrega_estimada ? formatearFecha(pedido.fecha_entrega_estimada) : 'Por definir'}
                          </span>
                        </div>
                        {pedido.fecha_entrega && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de entrega:</span>
                            <span className="font-medium text-green-600">{formatearFecha(pedido.fecha_entrega)}</span>
                          </div>
                        )}
                        {pedido.tracking && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tracking:</span>
                            <span className="font-medium font-mono">{pedido.tracking}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {pedido.notas && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-1">Notas:</h5>
                      <p className="text-blue-700 text-sm">{pedido.notas}</p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="mt-4 flex gap-3">
                    {pedido.estado === 'pendiente' && (
                      <>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          Confirmar Pedido
                        </button>
                        <button
                          onClick={() => cancelarPedido(pedido.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Cancelar Pedido
                        </button>
                      </>
                    )}
                    {pedido.estado === 'confirmado' && (
                      <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                        Marcar como Enviado
                      </button>
                    )}
                    {pedido.tracking && (
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Rastrear Envío
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje si no hay pedidos */}
          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay pedidos
              </h3>
              <p className="text-gray-500 mb-6">
                {filtroEstado === 'todos' 
                  ? 'Aún no hay pedidos registrados en el sistema'
                  : `No hay pedidos con estado "${filtroEstado}"`
                }
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-12 bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Sistema de Gestión de Pedidos
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
      </main>
      <Footer />
    </div>
  )
}
