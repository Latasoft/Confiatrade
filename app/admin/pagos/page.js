'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function PagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPago, setModalPago] = useState(false);
  const [pagoActual, setPagoActual] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // todos, pagado, pendiente, fallido
  const [comentario, setComentario] = useState('');

  const supabase = useSupabase();

  useEffect(() => {
    fetchPagos();
  }, [filtro, supabase]);

  async function fetchPagos() {
    try {
      setLoading(true);
      let query = supabase
        .from('pagos')
        .select(`
          *,
          solicitudes_carga(*),
          envios(*)
        `);
      
      // Aplicar filtro si no es 'todos'
      if (filtro !== 'todos') {
        query = query.eq('estado', filtro);
      }
      
      const { data, error } = await query.order('fecha', { ascending: false });
      
      if (error) throw error;
      setPagos(data || []);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  }

  function verDetalles(pago) {
    setPagoActual(pago);
    setModalPago(true);
  }

  async function validarPago() {
    try {
      const { error } = await supabase
        .from('pagos')
        .update({ 
          estado: 'pagado',
          comentario_admin: comentario,
          fecha_validacion: new Date().toISOString()
        })
        .eq('id', pagoActual.id);

      if (error) throw error;
      
      toast.success('Pago validado correctamente');
      setModalPago(false);
      fetchPagos();
    } catch (error) {
      console.error('Error al validar pago:', error);
      toast.error('Error al validar el pago');
    }
  }

  async function marcarComoPendiente() {
    try {
      const { error } = await supabase
        .from('pagos')
        .update({ 
          estado: 'pendiente',
          comentario_admin: comentario,
          fecha_validacion: new Date().toISOString()
        })
        .eq('id', pagoActual.id);

      if (error) throw error;
      
      toast.success('Pago marcado como pendiente');
      setModalPago(false);
      fetchPagos();
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      toast.error('Error al actualizar el estado del pago');
    }
  }

  async function marcarComoFallido() {
    try {
      const { error } = await supabase
        .from('pagos')
        .update({ 
          estado: 'fallido',
          comentario_admin: comentario,
          fecha_validacion: new Date().toISOString()
        })
        .eq('id', pagoActual.id);

      if (error) throw error;
      
      toast.success('Pago marcado como fallido');
      setModalPago(false);
      fetchPagos();
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      toast.error('Error al actualizar el estado del pago');
    }
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case 'pagado': return 'bg-green-500';
      case 'pendiente': return 'bg-yellow-500';
      case 'fallido': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Validación de Pagos</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setFiltro('todos')} 
          className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFiltro('pagado')} 
          className={`px-4 py-2 rounded ${filtro === 'pagado' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Pagados
        </button>
        <button 
          onClick={() => setFiltro('pendiente')} 
          className={`px-4 py-2 rounded ${filtro === 'pendiente' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Pendientes
        </button>
        <button 
          onClick={() => setFiltro('fallido')} 
          className={`px-4 py-2 rounded ${filtro === 'fallido' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Fallidos
        </button>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p>Cargando pagos...</p>
        </div>
      ) : pagos.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay pagos {filtro !== 'todos' ? `en estado "${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-lg bg-white">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">ID</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Referencia</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Método</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50 text-center">
                  <td className="p-2">{pago.id}</td>
                  <td className="p-2">{pago.cliente_nombre || pago.cliente_id}</td>
                  <td className="p-2">{pago.referencia}</td>
                  <td className="p-2">${pago.monto}</td>
                  <td className="p-2">{pago.metodo_pago}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-white ${getEstadoColor(pago.estado)}`}>
                      {pago.estado}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(pago.fecha).toLocaleDateString()}
                  </td>
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => verDetalles(pago)}
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

      {/* Modal de detalles de pago */}
      {modalPago && pagoActual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalles del Pago #{pagoActual.id}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold">Información del Cliente</h3>
                <p><strong>Nombre:</strong> {pagoActual.cliente_nombre}</p>
                <p><strong>ID:</strong> {pagoActual.cliente_id}</p>
                <p><strong>Email:</strong> {pagoActual.cliente_email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Información del Pago</h3>
                <p><strong>Referencia:</strong> {pagoActual.referencia}</p>
                <p><strong>Monto:</strong> ${pagoActual.monto}</p>
                <p><strong>Método:</strong> {pagoActual.metodo_pago}</p>
                <p><strong>Fecha:</strong> {new Date(pagoActual.fecha).toLocaleDateString()}</p>
                <p>
                  <strong>Estado:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-white ${getEstadoColor(pagoActual.estado)}`}>
                    {pagoActual.estado}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold">Detalles de la Transacción</h3>
              <p><strong>ID de Transacción:</strong> {pagoActual.transaccion_id || 'No disponible'}</p>
              <p><strong>Comprobante:</strong> 
                {pagoActual.comprobante_url ? (
                  <a 
                    href={pagoActual.comprobante_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    Ver comprobante
                  </a>
                ) : 'No disponible'}
              </p>
              {pagoActual.notas && (
                <p><strong>Notas:</strong> {pagoActual.notas}</p>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold">Servicio Asociado</h3>
              <p><strong>Tipo:</strong> {pagoActual.tipo_servicio}</p>
              <p><strong>ID Servicio:</strong> {pagoActual.servicio_id}</p>
              {pagoActual.solicitudes_carga && (
                <p><strong>Solicitud de carga:</strong> {pagoActual.solicitudes_carga.producto_nombre}</p>
              )}
              {pagoActual.envios && (
                <p><strong>Envío:</strong> {pagoActual.envios.origen} → {pagoActual.envios.destino}</p>
              )}
            </div>
            
            {/* Comentarios del administrador */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Comentarios</h3>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full border rounded p-2"
                rows="3"
                placeholder="Añade un comentario sobre este pago..."
              ></textarea>
            </div>
            
            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalPago(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cerrar
              </button>
              
              <button
                onClick={marcarComoFallido}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Marcar como Fallido
              </button>
              
              <button
                onClick={marcarComoPendiente}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Marcar como Pendiente
              </button>
              
              <button
                onClick={validarPago}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Validar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}