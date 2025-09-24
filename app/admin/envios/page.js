'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function EnviosPage() {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // todos, pendiente, en_transito, entregado
  const [mostrarMapa, setMostrarMapa] = useState(false);

  useEffect(() => {
    fetchEnvios();
  }, [filtro]);

  async function fetchEnvios() {
    try {
      setLoading(true);
      // Usar la tabla de envíos directamente
      let query = supabase
        .from('envios')
        .select('*');
      
      // Aplicar filtro si no es 'todos'
      if (filtro !== 'todos') {
        query = query.eq('estado', filtro);
      }
      
      const { data, error } = await query.order('fecha_salida', { ascending: false });
      
      if (error) throw error;
      setEnvios(data || []);
    } catch (error) {
      console.error('Error al cargar envíos:', error);
      toast.error('Error al cargar los envíos');
    } finally {
      setLoading(false);
    }
  }

  function verDetalles(envio) {
    setEnvioSeleccionado(envio);
  }

  function toggleMapa() {
    setMostrarMapa(!mostrarMapa);
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500';
      case 'en_preparacion': return 'bg-orange-500';
      case 'en_transito': return 'bg-blue-500';
      case 'entregado': return 'bg-green-500';
      case 'retrasado': return 'bg-red-500';
      case 'incidencia': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  }

  async function actualizarEstadoEnvio(id, nuevoEstado) {
    try {
      const { error } = await supabase
        .from('envios')
        .update({ 
          estado: nuevoEstado,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
      fetchEnvios();
      
      // Actualizar el envío seleccionado si es el mismo
      if (envioSeleccionado && envioSeleccionado.id === id) {
        setEnvioSeleccionado({
          ...envioSeleccionado,
          estado: nuevoEstado,
          fecha_actualizacion: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado del envío');
    }
  }

  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO');
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(precio);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Seguimiento de Envíos</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setFiltro('todos')} 
          className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFiltro('pendiente')} 
          className={`px-4 py-2 rounded ${filtro === 'pendiente' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Pendientes
        </button>
        <button 
          onClick={() => setFiltro('en_preparacion')} 
          className={`px-4 py-2 rounded ${filtro === 'en_preparacion' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          En Preparación
        </button>
        <button 
          onClick={() => setFiltro('en_transito')} 
          className={`px-4 py-2 rounded ${filtro === 'en_transito' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          En Tránsito
        </button>
        <button 
          onClick={() => setFiltro('entregado')} 
          className={`px-4 py-2 rounded ${filtro === 'entregado' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Entregados
        </button>
      </div>

      {/* Vista dividida: Tabla y Mapa */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabla de envíos */}
        <div className={`${mostrarMapa ? 'lg:w-1/2' : 'w-full'}`}>
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner"></div>
              <p>Cargando envíos...</p>
            </div>
          ) : envios.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay envíos {filtro !== 'todos' ? `en estado "${filtro}"` : ''}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-lg bg-white">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="p-2">ID</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Origen</th>
                    <th className="p-2">Destino</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Fecha salida</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {envios.map((envio) => (
                    <tr 
                      key={envio.id} 
                      className={`hover:bg-gray-50 text-center ${envioSeleccionado?.id === envio.id ? 'bg-blue-50' : ''}`}
                      onClick={() => verDetalles(envio)}
                    >
                      <td className="p-2">{envio.id}</td>
                      <td className="p-2">{envio.tipo_servicio || 'Individual'}</td>
                      <td className="p-2">{envio.origen}</td>
                      <td className="p-2">{envio.destino}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-white ${getEstadoColor(envio.estado)}`}>
                          {envio.estado}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(envio.fecha_salida).toLocaleDateString()}
                      </td>
                      <td className="p-2 flex gap-2 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            verDetalles(envio);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          👁️ Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mapa o detalles del envío */}
        {mostrarMapa ? (
          <div className="lg:w-1/2 bg-gray-100 rounded-lg p-4 min-h-[400px]">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Mapa de seguimiento</h2>
              <button 
                onClick={toggleMapa}
                className="text-blue-600 hover:underline"
              >
                Ocultar mapa
              </button>
            </div>
            <div className="bg-white border rounded-lg p-4 h-[500px] flex items-center justify-center">
              {/* Aquí se integraría un mapa real con una librería como Google Maps, Mapbox, etc. */}
              <div className="text-center">
                <p className="mb-4">Mapa de seguimiento en tiempo real</p>
                <p className="text-sm text-gray-500">
                  (En una implementación real, aquí se mostraría un mapa interactivo con la ubicación de los envíos)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-end">
            <button 
              onClick={toggleMapa}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Mostrar mapa
            </button>
          </div>
        )}
      </div>

      {/* Detalles del envío seleccionado */}
      {envioSeleccionado && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Detalles del Envío #{envioSeleccionado.id}</h2>
            <button 
              onClick={() => setEnvioSeleccionado(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Información General</h3>
              <p><strong>Tipo:</strong> {envioSeleccionado.carga_consolidada_id ? 'Carga Consolidada' : 'Carga Individual'}</p>
              <p><strong>Origen:</strong> {envioSeleccionado.origen}</p>
              <p><strong>Destino:</strong> {envioSeleccionado.destino}</p>
              <p><strong>Fecha de salida:</strong> {new Date(envioSeleccionado.fecha_salida).toLocaleDateString()}</p>
              <p><strong>Fecha estimada de llegada:</strong> {new Date(envioSeleccionado.fecha_estimada_llegada).toLocaleDateString()}</p>
              <p><strong>Transportista:</strong> {envioSeleccionado.transportista}</p>
              <p><strong>Vehículo:</strong> {envioSeleccionado.vehiculo}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Estado del Envío</h3>
              <p>
                <span className={`px-2 py-1 rounded text-white ${getEstadoColor(envioSeleccionado.estado)}`}>
                  {envioSeleccionado.estado}
                </span>
              </p>
              <p className="mt-2"><strong>Última actualización:</strong> {new Date(envioSeleccionado.fecha_actualizacion).toLocaleString()}</p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Actualizar estado:</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => actualizarEstadoEnvio(envioSeleccionado.id, 'en_preparacion')}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    En preparación
                  </button>
                  <button 
                    onClick={() => actualizarEstadoEnvio(envioSeleccionado.id, 'en_transito')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    En tránsito
                  </button>
                  <button 
                    onClick={() => actualizarEstadoEnvio(envioSeleccionado.id, 'entregado')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Entregado
                  </button>
                  <button 
                    onClick={() => actualizarEstadoEnvio(envioSeleccionado.id, 'retrasado')}
                    className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Retrasado
                  </button>
                  <button 
                    onClick={() => actualizarEstadoEnvio(envioSeleccionado.id, 'incidencia')}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Incidencia
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Historial de seguimiento */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Historial de Seguimiento</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <ul className="space-y-4">
                {/* En una implementación real, estos datos vendrían de la base de datos */}
                <li className="flex items-start">
                  <div className="mr-4 w-24 text-sm text-gray-500">{new Date(envioSeleccionado.fecha_salida).toLocaleString()}</div>
                  <div>
                    <span className="font-medium">Envío iniciado</span>
                    <p className="text-sm text-gray-600">El envío ha salido del origen {envioSeleccionado.origen}</p>
                  </div>
                </li>
                {envioSeleccionado.estado !== 'en_preparacion' && (
                  <li className="flex items-start">
                    <div className="mr-4 w-24 text-sm text-gray-500">{new Date(new Date(envioSeleccionado.fecha_salida).getTime() + 86400000).toLocaleString()}</div>
                    <div>
                      <span className="font-medium">En tránsito</span>
                      <p className="text-sm text-gray-600">El envío está en camino hacia {envioSeleccionado.destino}</p>
                    </div>
                  </li>
                )}
                {envioSeleccionado.estado === 'entregado' && (
                  <li className="flex items-start">
                    <div className="mr-4 w-24 text-sm text-gray-500">{new Date(envioSeleccionado.fecha_actualizacion).toLocaleString()}</div>
                    <div>
                      <span className="font-medium">Entregado</span>
                      <p className="text-sm text-gray-600">El envío ha sido entregado en {envioSeleccionado.destino}</p>
                    </div>
                  </li>
                )}
                {envioSeleccionado.estado === 'retrasado' && (
                  <li className="flex items-start">
                    <div className="mr-4 w-24 text-sm text-gray-500">{new Date(envioSeleccionado.fecha_actualizacion).toLocaleString()}</div>
                    <div>
                      <span className="font-medium text-orange-500">Retrasado</span>
                      <p className="text-sm text-gray-600">El envío presenta un retraso en la entrega</p>
                    </div>
                  </li>
                )}
                {envioSeleccionado.estado === 'incidencia' && (
                  <li className="flex items-start">
                    <div className="mr-4 w-24 text-sm text-gray-500">{new Date(envioSeleccionado.fecha_actualizacion).toLocaleString()}</div>
                    <div>
                      <span className="font-medium text-red-500">Incidencia reportada</span>
                      <p className="text-sm text-gray-600">Se ha reportado una incidencia con el envío</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Información de clientes involucrados */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Clientes Involucrados</h3>
            <div className="border rounded-lg p-4">
              {envioSeleccionado.carga_consolidada_id ? (
                <p>Carga consolidada con múltiples clientes</p>
              ) : (
                <div>
                  <p><strong>Cliente:</strong> {envioSeleccionado.solicitudes_carga?.cliente_nombre || 'No disponible'}</p>
                  <p><strong>Email:</strong> {envioSeleccionado.solicitudes_carga?.cliente_email || 'No disponible'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}