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
      // Verificar si requiere transporte y hay contacto válido
      if (solicitudActual.requiere_transporte) {
        if (!contactoTransporte.trim()) {
          toast.error('Debes proporcionar tu contacto para que el cliente se comunique contigo');
          return;
        }
        if (contactoTransporte.trim().length < 8) {
          toast.error('Tu contacto debe tener mínimo 8 caracteres');
          return;
        }
      }

      const updateData = { 
        estado_pago: 'aprobado'
      };

      // Agregar contacto del admin si se proporcionó
      if (solicitudActual.requiere_transporte && contactoTransporte.trim()) {
        updateData.contacto_transporte = contactoTransporte.trim();
        updateData.mensaje = `¡Pago Aprobado! 📞 Contáctate con el administrador para coordinar el transporte: ${contactoTransporte.trim()}`;
      } else {
        updateData.mensaje = '¡Pago Aprobado! ✅ Tu producto está listo.';
      }

      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      const mensajeExito = solicitudActual.requiere_transporte 
        ? 'Pago aprobado. El cliente recibirá tu contacto para coordinar el transporte.' 
        : 'Pago aprobado correctamente.';
      
      toast.success(mensajeExito);
      setContactoTransporte(''); // Limpiar el campo
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
          estado_pago: 'rechazado'
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
                      {s.estado_pago === 'aprobado' ? '✅ Aprobado' :
                       s.estado_pago === 'comprobante_enviado' ? '📄 Comprobante' :
                       s.estado_pago === 'rechazado' ? '❌ Rechazado' :
                       '⏳ Pendiente'}
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

            {/* Información del comprobante si existe */}
            {solicitudActual.estado_pago === 'comprobante_enviado' && (solicitudActual.comprobante_data || (solicitudActual.mensaje && solicitudActual.mensaje.includes('Comprobante:'))) && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">📄 Comprobante de Pago Subido</h3>
                
                {/* Información del archivo */}
                <div className="text-sm text-green-700 mb-3">
                  {solicitudActual.mensaje}
                </div>

                {/* Mostrar el comprobante si existe */}
                {solicitudActual.comprobante_data && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-800 mb-2">Vista previa del comprobante:</p>
                    <div className="border border-green-300 rounded-lg p-2 bg-white max-w-md">
                      {solicitudActual.comprobante_data.startsWith('data:image/') ? (
                        <img 
                          src={solicitudActual.comprobante_data} 
                          alt="Comprobante de pago"
                          className="max-w-full h-auto rounded cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(solicitudActual.comprobante_data, '_blank')}
                          style={{maxHeight: '200px'}}
                        />
                      ) : solicitudActual.comprobante_data.startsWith('data:application/pdf') ? (
                        <div className="text-center p-4">
                          <p className="text-sm text-gray-600 mb-2">📄 Documento PDF</p>
                          <a 
                            href={solicitudActual.comprobante_data} 
                            download={solicitudActual.comprobante_url || 'comprobante.pdf'}
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            📥 Descargar PDF
                          </a>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-gray-600">
                          <p className="text-sm">📎 Archivo adjunto</p>
                          <a 
                            href={solicitudActual.comprobante_data} 
                            download={solicitudActual.comprobante_url || 'comprobante'}
                            className="text-blue-600 hover:underline"
                          >
                            Descargar archivo
                          </a>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      💡 Haz clic en la imagen para ampliarla o usa el botón de descarga
                    </p>
                  </div>
                )}

                <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-600">
                  ℹ️ Revisa el comprobante arriba y verifica la transferencia en tu cuenta bancaria antes de aprobar el pago.
                </div>
              </div>
            )}

            {/* Proceso de aprobación */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                📋 Proceso: 1° Aprobar Solicitud → 2° Gestionar Pago (cuando cliente envíe comprobante)
              </p>
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
                <div className="space-y-2">
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
                  {solicitudActual.estado !== 'aprobada' && solicitudActual.estado_pago === 'comprobante_enviado' && (
                    <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                      ⚠️ Debe aprobar la solicitud antes de gestionar el pago
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gestión de Pago - Solo visible si la solicitud está aprobada Y hay comprobante enviado */}
            {solicitudActual.estado === 'aprobada' && solicitudActual.estado_pago === 'comprobante_enviado' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-3 text-blue-800">💳 Gestión de Pago</h3>
                
                <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    ✅ Comprobante recibido del cliente
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Revisa los detalles del comprobante arriba y verifica la transferencia en tu cuenta bancaria.
                  </p>
                </div>

                {/* Botón para descargar comprobante */}
                {solicitudActual.comprobante_data && (
                  <div className="mb-4 p-3 bg-white rounded border border-blue-300">
                    <p className="text-sm font-medium text-blue-800 mb-2">📄 Descargar Comprobante</p>
                    <a 
                      href={solicitudActual.comprobante_data} 
                      download={solicitudActual.comprobante_url || 'comprobante_pago'}
                      className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      📥 Descargar Archivo
                    </a>
                  </div>
                )}

                {/* Campo para contacto del admin si requiere transporte */}
                {solicitudActual.requiere_transporte && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <label className="block text-sm font-medium text-yellow-800 mb-2">
                      � Tu Contacto para el Cliente (Requerido)
                    </label>
                    <input
                      type="text"
                      value={contactoTransporte}
                      onChange={(e) => setContactoTransporte(e.target.value)}
                      placeholder="Ej: WhatsApp +56912345678, Email: admin@confiatrade.cl"
                      className={`w-full p-2 border rounded text-sm focus:outline-none ${
                        contactoTransporte.trim().length > 0 && contactoTransporte.trim().length < 8
                          ? 'border-red-300 focus:border-red-500 bg-red-50'
                          : contactoTransporte.trim().length >= 8
                          ? 'border-green-300 focus:border-green-500 bg-green-50'
                          : 'border-yellow-300 focus:border-yellow-500'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-yellow-600">
                        💡 El cliente recibirá este contacto para coordinar el transporte contigo
                      </p>
                      <p className={`text-xs ${
                        contactoTransporte.trim().length < 8 
                          ? contactoTransporte.trim().length > 0 ? 'text-red-600' : 'text-gray-500'
                          : 'text-green-600'
                      }`}>
                        {contactoTransporte.trim().length}/8 min
                      </p>
                    </div>
                    {contactoTransporte.trim().length > 0 && contactoTransporte.trim().length < 8 && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Mínimo 8 caracteres requeridos
                      </p>
                    )}
                  </div>
                )}

                {/* Mensaje informativo sobre transporte */}
                {!solicitudActual.requiere_transporte && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      ✨ <strong>Sin transporte requerido:</strong> Este producto no requiere transporte. 
                      Puedes aprobar directamente el pago.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={rechazarPago}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    ❌ Rechazar Pago
                  </button>
                  <button
                    onClick={aprobarPago}
                    disabled={solicitudActual.requiere_transporte && (!contactoTransporte.trim() || contactoTransporte.trim().length < 8)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ✅ Aprobar Pago
                  </button>
                </div>

                {/* Mensaje de ayuda */}
                <p className="text-xs text-blue-600 mt-2">
                  {solicitudActual.requiere_transporte 
                    ? contactoTransporte.trim().length >= 8
                      ? '✅ Tu contacto está listo - El cliente recibirá esta información'
                      : '⚠️ Proporciona tu contacto para que el cliente pueda comunicarse contigo (mín. 8 caracteres)'
                    : '✅ Listo para aprobar - No requiere información adicional'
                  }
                </p>
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