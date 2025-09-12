'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function SolicitudesPage() {
  const supabase = useSupabase();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [filtro, setFiltro] = useState('pendiente'); // pendiente, aprobada, rechazada, todas
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, [filtro]);

  async function fetchSolicitudes() {
    try {
      setLoading(true);
      let query = supabase.from('solicitudes_carga').select('*');
      
      // Aplicar filtro si no es 'todas'
      if (filtro !== 'todas') {
        query = query.eq('estado', filtro);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }

  function verDetalles(solicitud) {
    setSolicitudActual(solicitud);
    setModalSolicitud(true);
  }

  async function aprobarSolicitud() {
    try {
      const { error } = await supabase
        .from('solicitudes_carga')
        .update({ 
          estado: 'aprobada',
          comentario_admin: comentario,
          fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Solicitud aprobada correctamente');
      setModalSolicitud(false);
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      toast.error('Error al aprobar la solicitud');
    }
  }

  async function solicitarMasInfo() {
    try {
      const { error } = await supabase
        .from('solicitudes_carga')
        .update({ 
          estado: 'mas_info',
          comentario_admin: comentario,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Solicitud de más información enviada');
      setModalSolicitud(false);
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al solicitar más información:', error);
      toast.error('Error al solicitar más información');
    }
  }

  async function rechazarSolicitud() {
    try {
      const { error } = await supabase
        .from('solicitudes_carga')
        .update({ 
          estado: 'rechazada',
          comentario_admin: comentario,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Solicitud rechazada');
      setModalSolicitud(false);
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      toast.error('Error al rechazar la solicitud');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Solicitudes de Carga</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setFiltro('todas')} 
          className={`px-4 py-2 rounded ${filtro === 'todas' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Todas
        </button>
        <button 
          onClick={() => setFiltro('pendiente')} 
          className={`px-4 py-2 rounded ${filtro === 'pendiente' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Pendientes
        </button>
        <button 
          onClick={() => setFiltro('aprobada')} 
          className={`px-4 py-2 rounded ${filtro === 'aprobada' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Aprobadas
        </button>
        <button 
          onClick={() => setFiltro('rechazada')} 
          className={`px-4 py-2 rounded ${filtro === 'rechazada' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Rechazadas
        </button>
        <button 
          onClick={() => setFiltro('mas_info')} 
          className={`px-4 py-2 rounded ${filtro === 'mas_info' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Requieren más info
        </button>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay solicitudes {filtro !== 'todas' ? `en estado "${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-lg bg-white">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">ID</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Producto</th>
                <th className="p-2">Origen</th>
                <th className="p-2">Destino</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 text-center">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.cliente_nombre || s.cliente_id}</td>
                  <td className="p-2">{s.producto_nombre}</td>
                  <td className="p-2">{s.origen}</td>
                  <td className="p-2">{s.destino}</td>
                  <td className="p-2">
                    <span className={
                      `px-2 py-1 rounded text-white ${
                        s.estado === 'aprobada' ? 'bg-green-500' : 
                        s.estado === 'rechazada' ? 'bg-red-500' : 
                        s.estado === 'mas_info' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`
                    }>
                      {s.estado}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => verDetalles(s)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      👁️ Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles de solicitud */}
      {modalSolicitud && solicitudActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalles de la Solicitud #{solicitudActual.id}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold">Información del Cliente</h3>
                <p><strong>Nombre:</strong> {solicitudActual.cliente_nombre}</p>
                <p><strong>ID:</strong> {solicitudActual.cliente_id}</p>
                <p><strong>Email:</strong> {solicitudActual.cliente_email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Información del Envío</h3>
                <p><strong>Origen:</strong> {solicitudActual.origen}</p>
                <p><strong>Destino:</strong> {solicitudActual.destino}</p>
                <p><strong>Fecha estimada:</strong> {solicitudActual.fecha_estimada}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold">Detalles del Producto</h3>
              <p><strong>Nombre:</strong> {solicitudActual.producto_nombre}</p>
              <p><strong>Descripción:</strong> {solicitudActual.producto_descripcion}</p>
              <p><strong>Peso:</strong> {solicitudActual.peso} kg</p>
              <p><strong>Dimensiones:</strong> {solicitudActual.dimensiones}</p>
              <p><strong>Valor declarado:</strong> ${solicitudActual.valor_declarado}</p>
              <p><strong>Requiere refrigeración:</strong> {solicitudActual.requiere_refrigeracion ? 'Sí' : 'No'}</p>
              <p><strong>Requiere manejo especial:</strong> {solicitudActual.manejo_especial ? 'Sí' : 'No'}</p>
              {solicitudActual.notas && (
                <p><strong>Notas adicionales:</strong> {solicitudActual.notas}</p>
              )}
            </div>
            
            {solicitudActual.documentos_url && (
              <div className="mb-6">
                <h3 className="font-semibold">Documentos</h3>
                <div className="flex gap-2">
                  {Array.isArray(solicitudActual.documentos_url) ? (
                    solicitudActual.documentos_url.map((doc, index) => (
                      <a 
                        key={index} 
                        href={doc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver documento {index + 1}
                      </a>
                    ))
                  ) : (
                    <a 
                      href={solicitudActual.documentos_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver documento
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Comentarios del administrador */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Comentarios para el cliente</h3>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full border rounded p-2"
                rows="3"
                placeholder="Añade un comentario para el cliente..."
              ></textarea>
            </div>
            
            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalSolicitud(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cerrar
              </button>
              
              {solicitudActual.estado === 'pendiente' && (
                <>
                  <button
                    onClick={rechazarSolicitud}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={solicitarMasInfo}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    Solicitar más info
                  </button>
                  <button
                    onClick={aprobarSolicitud}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Aprobar solicitud
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}