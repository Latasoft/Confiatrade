'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [filtro, setFiltro] = useState('pendiente'); // pendiente, aprobada, rechazada, mas_info, producto_finalizada, todas
  const [contactoTransporte, setContactoTransporte] = useState('');
  const [comentarioSolicitud, setComentarioSolicitud] = useState('');
  const [comentarioPago, setComentarioPago] = useState('');
  const [comentarioProducto, setComentarioProducto] = useState('');

  useEffect(() => {
    fetchSolicitudes();
  }, [filtro]);

  async function fetchSolicitudes() {
    try {
      setLoading(true);
      let query = supabase.from('solicitudes_compra').select('*');
      
      // Aplicar filtro si no es 'todas'
      if (filtro !== 'todas') {
        if (filtro === 'producto_finalizada') {
          // Solo filtrar por estado_producto si la columna existe
          try {
            query = query.eq('estado_producto', 'finalizada');
          } catch (error) {
            console.warn('Columna estado_producto no existe aún. Ejecuta el script SQL primero.');
            query = query.eq('estado', 'pendiente'); // Fallback temporal
          }
        } else {
          query = query.eq('estado', filtro);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Procesar solicitudes y mostrar ID de cliente de forma más amigable
      const solicitudesConNombres = (data || []).map(solicitud => {
        // Extraer las primeras 8 letras/números del cliente_id para mostrar
        const clienteDisplay = solicitud.cliente_nombre 
          || solicitud.cliente_email 
          || (solicitud.cliente_id ? `Usuario-${solicitud.cliente_id.substring(0, 8)}...` : 'Usuario desconocido');
          
        return {
          ...solicitud,
          cliente_nombre: clienteDisplay
        };
      });
      
      setSolicitudes(solicitudesConNombres);
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
    setContactoTransporte('');
    setComentarioSolicitud('');
    setComentarioPago('');
    setComentarioProducto('');
  }

  async function aprobarSolicitud() {
    try {
      const updateData = { 
        estado: 'aprobada'
      };
      
      // Agregar comentario si se proporcionó
      if (comentarioSolicitud.trim()) {
        updateData.comentario_solicitud = comentarioSolicitud.trim();
        updateData.mensaje = `Solicitud Aprobada ✅ - Comentario del Admin: ${comentarioSolicitud.trim()}`;
      } else {
        updateData.mensaje = 'Solicitud Aprobada ✅ - Puedes proceder a realizar el pago.';
      }
      
      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
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
      const updateData = { 
        estado: 'mas_info'
      };
      
      // El comentario es obligatorio para solicitar más info
      if (!comentarioSolicitud.trim()) {
        toast.error('Debes especificar qué información adicional necesitas');
        return;
      }
      
      updateData.comentario_solicitud = comentarioSolicitud.trim();
      updateData.mensaje = `Más Información Solicitada ℹ️ - Admin: ${comentarioSolicitud.trim()}`;
      
      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
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
      const updateData = { 
        estado: 'rechazada'
      };
      
      // Agregar comentario si se proporcionó
      if (comentarioSolicitud.trim()) {
        updateData.comentario_solicitud = comentarioSolicitud.trim();
        updateData.mensaje = `Solicitud Rechazada ❌ - Motivo: ${comentarioSolicitud.trim()}`;
      } else {
        updateData.mensaje = 'Solicitud Rechazada ❌';
      }
      
      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
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

  async function finalizarCompraProducto() {
    try {
      // Verificar si la columna estado_producto existe
      const updateData = {};
      
      // Solo intentar actualizar estado_producto si la columna existe
      if (solicitudActual.hasOwnProperty('estado_producto')) {
        updateData.estado_producto = 'finalizada';
      } else {
        toast.error('⚠️ Primero ejecuta el script SQL para agregar la columna estado_producto');
        return;
      }
      
      // Agregar comentario específico del producto finalizado
      if (comentarioProducto.trim()) {
        updateData.comentario_producto = comentarioProducto.trim();
        updateData.mensaje = `¡Compra Finalizada! ✅ Tu producto ha sido entregado exitosamente. Comentario del Admin: ${comentarioProducto.trim()} | ¡Gracias por confiar en nosotros!`;
      } else {
        updateData.mensaje = '¡Compra Finalizada! ✅ Tu producto ha sido entregado exitosamente. ¡Gracias por confiar en nosotros!';
      }

      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      toast.success('Compra de producto marcada como finalizada');
      cerrarModal();
      fetchSolicitudes();
    } catch (error) {
      console.error('Error al finalizar compra de producto:', error);
      toast.error('Error al finalizar la compra del producto. ¿Ejecutaste el script SQL?');
    }
  }

  async function aprobarPago() {
    try {
      // Verificar contacto válido - SIEMPRE REQUERIDO
      if (!contactoTransporte.trim()) {
        toast.error('Debes proporcionar tu contacto para que el cliente se comunique contigo');
        return;
      }
      if (contactoTransporte.trim().length < 8) {
        toast.error('Tu contacto debe tener mínimo 8 caracteres');
        return;
      }

      const updateData = { 
        estado_pago: 'aprobado',
        contacto_transporte: contactoTransporte.trim()
      };
      
      // Agregar comentario específico del pago si se proporcionó
      if (comentarioPago.trim()) {
        updateData.comentario_pago = comentarioPago.trim();
      }

      // Solo agregar estado_producto si la columna existe (después de ejecutar el script SQL)
      if (solicitudActual.hasOwnProperty('estado_producto')) {
        updateData.estado_producto = 'en_proceso';
      }

      // Mensaje diferente según si requiere transporte o no
      let mensajeBase;
      if (solicitudActual.requiere_transporte) {
        mensajeBase = `¡Pago Aprobado! 🚚 Tu producto está en proceso. Contáctate con el Vendedor para coordinar Envío: ${contactoTransporte.trim()}`;
      } else {
        mensajeBase = `¡Pago Aprobado! � Tu producto está en proceso. Contáctate con el Vendedor para coordinar Entrega del Producto: ${contactoTransporte.trim()}`;
      }
      
      // Agregar comentario del admin si existe
      if (comentarioPago.trim()) {
        mensajeBase += ` | Comentario Admin: ${comentarioPago.trim()}`;
      }
      
      updateData.mensaje = mensajeBase;

      const { error } = await supabase
        .from('solicitudes_compra')
        .update(updateData)
        .eq('id', solicitudActual.id);

      if (error) throw error;
      
      const mensajeExito = 'Pago aprobado. El cliente recibirá tu contacto para comunicarse contigo.';
      
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
    <div className="container mx-auto p-6">
      {/* Header con glass effect */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
              Gestión de Solicitudes de Carga
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Administra las solicitudes de compra de los clientes</p>
          </div>
        </div>
      </div>
      
      {/* Filtros con glass effect */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => setFiltro('todas')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'todas' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFiltro('pendiente')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'pendiente' 
                ? 'bg-orange-500 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Pendientes
          </button>
          <button 
            onClick={() => setFiltro('aprobada')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'aprobada' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Aprobadas
          </button>
          <button 
            onClick={() => setFiltro('rechazada')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'rechazada' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Rechazadas
          </button>
          <button 
            onClick={() => setFiltro('mas_info')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'mas_info' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Requieren más info
          </button>
          <button 
            onClick={() => setFiltro('producto_finalizada')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'producto_finalizada' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Productos Finalizados
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="glass rounded-xl p-10 text-center">
          <div className="spinner"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No hay solicitudes {filtro !== 'todas' ? `en estado "${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">Cliente</th>
                <th className="p-2">Producto</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Total</th>
                <th className="p-2">Estado Solicitud</th>
                <th className="p-2">Estado Pago</th>
                <th className="p-2">Estado Producto</th>
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
                    <span className={
                      `px-2 py-1 rounded text-white ${
                        s.estado_producto === 'finalizada' ? 'bg-indigo-500' : 
                        s.estado_producto === 'en_proceso' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`
                    }>
                      {s.hasOwnProperty('estado_producto') ? (
                        s.estado_producto === 'finalizada' ? '✅ Finalizada' :
                        s.estado_producto === 'en_proceso' ? '🔄 En Proceso' :
                        '⏳ Pendiente'
                      ) : '⚠️ Script SQL'}
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
        </div>
      )}

      {/* Modal de detalles de solicitud */}
      {modalSolicitud && solicitudActual && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Detalles de la Solicitud #{solicitudActual.id}</h2>
            
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
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">1. Estado de Solicitud</h3>
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
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">2. Estado de Pago</h3>
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
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">3. Compra Producto</h3>
                <span className={
                  `px-3 py-1 rounded text-white ${
                    solicitudActual.estado_producto === 'finalizada' ? 'bg-indigo-500' : 
                    solicitudActual.estado_producto === 'en_proceso' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`
                }>
                  {solicitudActual.hasOwnProperty('estado_producto') ? (
                    solicitudActual.estado_producto === 'finalizada' ? 'Finalizada' :
                    solicitudActual.estado_producto === 'en_proceso' ? 'En Proceso' :
                    'Pendiente'
                  ) : 'Ejecutar Script SQL'}
                </span>
                {!solicitudActual.hasOwnProperty('estado_producto') && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Columna no encontrada</p>
                )}
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

                {/* Campo para contacto del admin - SIEMPRE OBLIGATORIO */}
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded">
                    <label className="block text-sm font-medium text-yellow-800 mb-2">
                      � Tu Contacto para el Cliente (Requerido)
                    </label>
                    <input
                      type="text"
                      value={contactoTransporte}
                      onChange={(e) => setContactoTransporte(e.target.value)}
                      placeholder="Ej: WhatsApp +56912345678, Email: admin@confiatrade.cl"
                      className={`w-full p-2 border rounded text-sm focus:outline-none text-gray-900 dark:text-white ${
                        contactoTransporte.trim().length > 0 && contactoTransporte.trim().length < 8
                          ? 'border-red-300 dark:border-red-600 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
                          : contactoTransporte.trim().length >= 8
                          ? 'border-green-300 dark:border-green-600 focus:border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-orange-300 dark:border-orange-600 focus:border-orange-500 bg-white dark:bg-gray-800'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        💡 El cliente recibirá este contacto para comunicarse contigo
                      </p>
                      <p className={`text-xs ${
                        contactoTransporte.trim().length < 8 
                          ? contactoTransporte.trim().length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {contactoTransporte.trim().length}/8 min
                      </p>
                    </div>
                    {contactoTransporte.trim().length > 0 && contactoTransporte.trim().length < 8 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        ⚠️ Mínimo 8 caracteres requeridos
                      </p>
                    )}
                  </div>

                <div className="flex gap-2">
                  <button
                    onClick={rechazarPago}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    ❌ Rechazar Pago
                  </button>
                  <button
                    onClick={aprobarPago}
                    disabled={!contactoTransporte.trim() || contactoTransporte.trim().length < 8}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ✅ Aprobar Pago
                  </button>
                </div>

                {/* Mensaje de ayuda */}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {contactoTransporte.trim().length >= 8
                    ? '✅ Tu contacto está listo - El cliente recibirá esta información'
                    : '⚠️ Proporciona tu contacto para que el cliente pueda comunicarse contigo (mín. 8 caracteres)'
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
            
            {/* Comentarios específicos por etapa */}
            <div className="mb-6 space-y-4">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">💬 Comentarios para el Cliente</h3>
              
              {/* Comentario para Solicitud */}
              {solicitudActual.estado === 'pendiente' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    📝 Comentario sobre la Solicitud
                  </label>
                  <textarea
                    value={comentarioSolicitud}
                    onChange={(e) => setComentarioSolicitud(e.target.value)}
                    className="w-full border border-blue-300 dark:border-blue-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder={
                      solicitudActual.estado === 'pendiente' 
                        ? "Opcional: Comentario al aprobar/rechazar solicitud."
                        : "Comentario sobre la solicitud..."
                    }
                  ></textarea>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    💡 Se mostrará al cliente cuando actualices el estado de la solicitud
                  </p>
                </div>
              )}
              
              {/* Comentario para Pago */}
              {solicitudActual.estado === 'aprobada' && solicitudActual.estado_pago === 'comprobante_enviado' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    💳 Comentario sobre el Pago
                  </label>
                  <textarea
                    value={comentarioPago}
                    onChange={(e) => setComentarioPago(e.target.value)}
                    className="w-full border border-green-300 dark:border-green-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows="2"
                    placeholder="Opcional: Comentario adicional sobre el pago aprobado..."
                  ></textarea>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    💡 Se mostrará junto con tu contacto cuando apruebes el pago
                  </p>
                </div>
              )}
              
              {/* Comentario para Producto Finalizado */}
              {solicitudActual.estado === 'aprobada' && solicitudActual.estado_pago === 'aprobado' && solicitudActual.hasOwnProperty('estado_producto') && solicitudActual.estado_producto !== 'finalizada' && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                    📦 Comentario al Finalizar Producto
                  </label>
                  <textarea
                    value={comentarioProducto}
                    onChange={(e) => setComentarioProducto(e.target.value)}
                    className="w-full border border-purple-300 dark:border-purple-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="2"
                    placeholder="Opcional: Comentario al entregar el producto finalizado..."
                  ></textarea>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    💡 Se mostrará cuando marques el producto como finalizado
                  </p>
                </div>
              )}
            </div>
            
            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
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
              
              {/* Botón para finalizar compra cuando solicitud y pago estén aprobados */}
              {solicitudActual.estado === 'aprobada' && solicitudActual.estado_pago === 'aprobado' && solicitudActual.hasOwnProperty('estado_producto') && solicitudActual.estado_producto !== 'finalizada' && (
                <button
                  onClick={finalizarCompraProducto}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  ✅ Finalizar Compra Producto
                </button>
              )}
              
              {/* Mensaje si no se ha ejecutado el script SQL */}
              {solicitudActual.estado === 'aprobada' && solicitudActual.estado_pago === 'aprobado' && !solicitudActual.hasOwnProperty('estado_producto') && (
                <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded border border-orange-300">
                  ⚠️ Para usar la funcionalidad de &quot;Compra Producto&quot;, ejecuta primero el script SQL
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}