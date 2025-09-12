'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabaseClient'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts'

export default function ReportesAdminPage() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    totalAdmins: 0,
    totalEnvios: 0,
    enviosEnProceso: 0,
    totalPagos: 0,
    montoTotalPagos: 0,
    conflictosActivos: 0,
    conflictosResueltos: 0,
    enviosPorEstado: [],
    pagosPorEstado: [],
    conflictosPorTipo: []
  })
  const [cargando, setCargando] = useState(true)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes') // mes, trimestre, año

  // 📌 Colores para los gráficos
  const colores = {
    pendiente: '#FACC15', // amarillo
    aprobado: '#22C55E', // verde
    rechazado: '#EF4444', // rojo
    en_transito: '#3B82F6', // azul
    entregado: '#8B5CF6', // morado
    consolidando: '#EC4899' // rosa
  }

  // 📌 Obtener fecha de inicio según el periodo seleccionado
  const obtenerFechaInicioPeriodo = () => {
    const fechaActual = new Date()
    let fechaInicio = new Date()
    
    switch (periodoSeleccionado) {
      case 'mes':
        fechaInicio.setMonth(fechaActual.getMonth() - 1)
        break
      case 'trimestre':
        fechaInicio.setMonth(fechaActual.getMonth() - 3)
        break
      case 'año':
        fechaInicio.setFullYear(fechaActual.getFullYear() - 1)
        break
    }
    
    return fechaInicio
  }

  // 📌 Cargar estadísticas desde Supabase
  const supabase = useSupabase()

  const fetchStats = async () => {
    try {
      const fechaInicio = obtenerFechaInicioPeriodo()
      
      // Usuarios
      const { data: usuarios } = await supabase.from('perfiles').select('*')
      const totalUsuarios = usuarios?.length || 0
      const totalClientes = usuarios?.filter((u) => u.rol === 'cliente').length || 0
      const totalAdmins = usuarios?.filter((u) => u.rol === 'admin').length || 0

      // Envíos
      const { data: envios } = await supabase.from('envios').select('*')
      const totalEnvios = envios?.length || 0
      const enviosEnProceso = envios?.filter(e => ['en_transito', 'preparando', 'consolidando'].includes(e.estado)).length || 0

      // Pagos
      const { data: pagos } = await supabase.from('pagos').select('*')
      const totalPagos = pagos?.length || 0
      const montoTotalPagos = pagos?.reduce((total, pago) => total + parseFloat(pago.monto || 0), 0) || 0

      // Conflictos
      const { data: conflictos } = await supabase.from('conflictos').select('*')
      const conflictosActivos = conflictos?.filter(c => c.estado === 'activo').length || 0
      const conflictosResueltos = conflictos?.filter(c => c.estado === 'resuelto').length || 0

      // Agrupamos envíos por estado
      const estados = ['pendiente', 'aprobado', 'en_transito', 'entregado', 'rechazado']
      const enviosPorEstado = estados.map(estado => ({
        name: estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' '),
        value: envios?.filter(e => e.estado === estado).length || 0,
        color: colores[estado] || '#CBD5E1'
      }))

      // Agrupamos pagos por estado
      const estadosPago = ['pendiente', 'aprobado', 'rechazado']
      const pagosPorEstado = estadosPago.map(estado => ({
        name: estado.charAt(0).toUpperCase() + estado.slice(1),
        value: pagos?.filter(p => p.estado === estado).length || 0,
        color: colores[estado] || '#CBD5E1'
      }))

      // Agrupamos conflictos por tipo
      const tiposConflicto = ['producto_danado', 'retraso_envio', 'error_facturacion', 'servicio_incompleto']
      const conflictosPorTipo = tiposConflicto.map(tipo => {
        let nombre = tipo
        switch (tipo) {
          case 'producto_danado': nombre = 'Producto dañado'; break
          case 'retraso_envio': nombre = 'Retraso en envío'; break
          case 'error_facturacion': nombre = 'Error de facturación'; break
          case 'servicio_incompleto': nombre = 'Servicio incompleto'; break
        }
        return {
          name: nombre,
          value: conflictos?.filter(c => c.tipo === tipo).length || 0,
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Color aleatorio
        }
      })

      setStats({
        totalUsuarios,
        totalClientes,
        totalAdmins,
        totalEnvios,
        enviosEnProceso,
        totalPagos,
        montoTotalPagos,
        conflictosActivos,
        conflictosResueltos,
        enviosPorEstado,
        pagosPorEstado,
        conflictosPorTipo
      })
    } catch (err) {
      console.error('❌ Error al cargar reportes:', err)
    }
    setCargando(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">📊 Reportes Generales</h1>

      {/* Filtros de periodo */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setPeriodoSeleccionado('mes')} 
          className={`px-4 py-2 rounded ${periodoSeleccionado === 'mes' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Último mes
        </button>
        <button 
          onClick={() => setPeriodoSeleccionado('trimestre')} 
          className={`px-4 py-2 rounded ${periodoSeleccionado === 'trimestre' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Último trimestre
        </button>
        <button 
          onClick={() => setPeriodoSeleccionado('año')} 
          className={`px-4 py-2 rounded ${periodoSeleccionado === 'año' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Último año
        </button>
      </div>

      {cargando ? (
        <p className="text-center">Cargando reportes...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold">Usuarios</h2>
              <p className="text-2xl font-bold">{stats.totalUsuarios}</p>
              <p className="text-sm text-gray-500">
                {stats.totalClientes} Clientes / {stats.totalAdmins} Admins
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold">Envíos</h2>
              <p className="text-2xl font-bold">{stats.totalEnvios}</p>
              <p className="text-sm text-gray-500">
                {stats.enviosEnProceso} en proceso
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold">Pagos</h2>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(stats.montoTotalPagos)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.totalPagos} transacciones
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold">Conflictos</h2>
              <p className="text-2xl font-bold">{stats.conflictosActivos}</p>
              <p className="text-sm text-gray-500">
                {stats.conflictosResueltos} resueltos
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Envíos por Estado</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.enviosPorEstado}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {stats.enviosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Pagos por Estado</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.pagosPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Conflictos por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.conflictosPorTipo}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {stats.conflictosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </main>
  )
}
