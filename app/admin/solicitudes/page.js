'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [filtro, setFiltro] = useState('pendiente'); // pendiente, aprobada, rechazada, todas
  const [comentario, setComentario] = useState('');
  const [contactoTransporte, setContactoTransporte] = useState('');
  const [descripcionPago, setDescripcionPago] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, [filtro]);

  async function fetchSolicitudes() {
    try {
      setLoading(true);
      let query = supabase.from('solicitudes_compra').select('*');
      
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

  function cerrarModal() {
    setModalSolicitud(false);
    setSolicitudActual(null);
    setComentario('');
    setContactoTransporte('');
    setDescripcionPago('');
  }

  async function aprobarSolicitud() {
    try {
      const { error } = await supabase
        .from('solicitudes_compra')
        .update({ 
          estado: 'aprobada'
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Solicitud aprobada correctamente');
      cerrarModal();
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      toast.error('Error al aprobar la solicitud');
    }
  }

  async function solicitarMasInfo() {
    try {
      const { error } = await supabase
        .from('solicitudes_compra')
        .update({ 
          estado: 'mas_info'
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Solicitud de más información enviada');
      cerrarModal();
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al solicitar más información:', error);
      toast.error('Error al solicitar más información');
    }
  }

  async function rechazarSolicitud() {
    try {
      const { error } = await supabase
        .from('solicitudes_compra')
        .update({ 
          estado: 'rechazada'
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Solicitud rechazada');
      cerrarModal();
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      toast.error('Error al rechazar la solicitud');
    }
  }

  async function aprobarPago() {
    try {
      const updateData = { 
        estado_pago: 'aprobado',
        descripcion_pago: descripcionPago.trim() || null
      };

      // Si requiere transporte, incluir contacto
      if (solicitudActual.requiere_transporte && contactoTransporte.trim()) {
        updateData.contacto_transporte = contactoTransporte.trim();
      }

      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Pago aprobado correctamente');
      cerrarModal();
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al aprobar pago:', error);
      toast.error('Error al aprobar el pago');
    }
  }

  async function rechazarPago() {
    try {
      const { error } = await supabase
        .from('solicitudes_compra')
        .update({ 
          estado_pago: 'rechazado',
          descripcion_pago: descripcionPago.trim() || null
        })
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Pago rechazado');
      cerrarModal();
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al rechazar pago:', error);
      toast.error('Error al rechazar el pago');
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
                <th className="p-2">Cantidad</th>
                <th className="p-2">Total</th>
                <th className="p-2">Estado Solicitud</th>
                <th className="p-2">Estado Pago</th>
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
                  <td className="p-2">{s.cantidad} kg</td>
                  <td className="p-2">${s.precio_total?.toLocaleString()}</td>
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
                    <span className={
                      `px-2 py-1 rounded text-white text-xs ${
                        s.estado_pago === 'aprobado' ? 'bg-green-600' : 
                        s.estado_pago === 'comprobante_enviado' ? 'bg-blue-500' :
                        s.estado_pago === 'rechazado' ? 'bg-red-600' :
                        'bg-gray-500'
                      }`
                    }>
                      {s.estado_pago === 'aprobado' ? 'Aprobado' :
                       s.estado_pago === 'comprobante_enviado' ? 'Comprobante' :
                       s.estado_pago === 'rechazado' ? 'Rechazado' :
                       'Pendiente'}
                    </span>
                  </td>
                  <td className="p-2">
                    {s.created_at ? 
                      new Date(s.created_at).toLocaleString('es-CL', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) 
                      : 'No disponible'
                    }
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
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold">Detalles del Producto</h3>
              <p><strong>Nombre:</strong> {solicitudActual.producto_nombre}</p>
              <p><strong>Cantidad:</strong> {solicitudActual.cantidad} kg</p>
              <p><strong>Precio unitario:</strong> ${solicitudActual.precio_unitario?.toLocaleString()}</p>
              <p><strong>Total:</strong> ${solicitudActual.precio_total?.toLocaleString()}</p>
              {solicitudActual.requiere_transporte && (
                <p><strong>Transporte:</strong> Requerido</p>
              )}
              {solicitudActual.mensaje && (
                <p><strong>Mensaje del cliente:</strong> {solicitudActual.mensaje}</p>
              )}
            </div>

            {/* Estados */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Estado de Solicitud</h3>
                <span className={
                  `px-3 py-1 rounded text-white ${
                    solicitudActual.estado === 'aprobada' ? 'bg-green-500' : 
                    solicitudActual.estado === 'rechazada' ? 'bg-red-500' : 
                    solicitudActual.estado === 'mas_info' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`
                }>
                  {solicitudActual.estado}
                </span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Estado de Pago</h3>
                <span className={
                  `px-3 py-1 rounded text-white ${
                    solicitudActual.estado_pago === 'aprobado' ? 'bg-green-600' : 
                    solicitudActual.estado_pago === 'comprobante_enviado' ? 'bg-blue-500' :
                    solicitudActual.estado_pago === 'rechazado' ? 'bg-red-600' :
                    'bg-gray-500'
                  }`
                }>
                  {solicitudActual.estado_pago === 'aprobado' ? 'Aprobado' :
                   solicitudActual.estado_pago === 'comprobante_enviado' ? 'Comprobante Enviado' :
                   solicitudActual.estado_pago === 'rechazado' ? 'Rechazado' :
                   'Pendiente'}
                </span>
              </div>
            </div>

            {/* Gestión de Pago - Solo visible si hay comprobante enviado */}
            {solicitudActual.estado_pago === 'comprobante_enviado' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-3 text-blue-800">Gestión de Pago</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Descripción del pago (opcional)</label>
                  <textarea
                    value={descripcionPago}
                    onChange={(e) => setDescripcionPago(e.target.value)}
                    className="w-full border rounded p-2"
                    rows="2"
                    placeholder="Agregar comentarios sobre el pago..."
                  />
                </div>

                {solicitudActual.requiere_transporte && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Contacto para transporte *</label>
                    <input
                      type="text"
                      value={contactoTransporte}
                      onChange={(e) => setContactoTransporte(e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Teléfono o email para coordinar transporte"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={rechazarPago}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Rechazar Pago
                  </button>
                  <button
                    onClick={aprobarPago}
                    disabled={solicitudActual.requiere_transporte && !contactoTransporte.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Aprobar Pago
                  </button>
                </div>
              </div>
            )}
            
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
                onClick={cerrarModal}
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