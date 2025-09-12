'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { toast } from 'react-hot-toast';

export default function ConflictosPage() {
  const [conflictos, setConflictos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conflictoActual, setConflictoActual] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [filtro, setFiltro] = useState('activos'); // activos, resueltos, todos
  const mensajesFinRef = useRef(null);

  useEffect(() => {
    fetchConflictos();
  }, [filtro]);

  useEffect(() => {
    if (conflictoActual) {
      fetchMensajes(conflictoActual.id);
      // Suscribirse a nuevos mensajes
      const subscription = supabase
        .channel(`conflicto-${conflictoActual.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_conflicto',
          filter: `conflicto_id=eq.${conflictoActual.id}`
        }, (payload) => {
          setMensajes(mensajes => [...mensajes, payload.new]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [conflictoActual]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  function scrollToBottom() {
    mensajesFinRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchConflictos() {
    try {
      setLoading(true);
      let query = supabase
        .from('conflictos')
        .select(`
          *,
          envios(*),
          profiles(nombre, email)
        `);
      
      // Aplicar filtro
      if (filtro === 'activos') {
        query = query.eq('estado', 'activo');
      } else if (filtro === 'resueltos') {
        query = query.eq('estado', 'resuelto');
      }
      
      const { data, error } = await query.order('fecha_creacion', { ascending: false });
      
      if (error) throw error;
      setConflictos(data || []);
    } catch (error) {
      console.error('Error al cargar conflictos:', error);
      toast.error('Error al cargar los conflictos');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMensajes(conflictoId) {
    try {
      const { data, error } = await supabase
        .from('mensajes_conflicto')
        .select('*')
        .eq('conflicto_id', conflictoId)
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      setMensajes(data || []);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      toast.error('Error al cargar los mensajes');
    }
  }

  async function enviarMensaje(e) {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conflictoActual) return;

    try {
      const { error } = await supabase
        .from('mensajes_conflicto')
        .insert([
          {
            conflicto_id: conflictoActual.id,
            remitente: 'admin',
            contenido: nuevoMensaje,
            fecha: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      setNuevoMensaje('');
      // Los mensajes se actualizarán a través de la suscripción
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje');
    }
  }

  async function marcarComoResuelto() {
    try {
      const { error } = await supabase
        .from('conflictos')
        .update({ 
          estado: 'resuelto',
          fecha_resolucion: new Date().toISOString()
        })
        .eq('id', conflictoActual.id);

      if (error) throw error;
      
      // Enviar mensaje de resolución
      await supabase
        .from('mensajes_conflicto')
        .insert([
          {
            conflicto_id: conflictoActual.id,
            remitente: 'admin',
            contenido: 'Este conflicto ha sido marcado como resuelto por el administrador.',
            fecha: new Date().toISOString(),
            es_sistema: true
          }
        ]);
      
      toast.success('Conflicto marcado como resuelto');
      fetchConflictos();
      
      // Actualizar el conflicto actual
      setConflictoActual({
        ...conflictoActual,
        estado: 'resuelto',
        fecha_resolucion: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al resolver conflicto:', error);
      toast.error('Error al resolver el conflicto');
    }
  }

  async function reabrirConflicto() {
    try {
      const { error } = await supabase
        .from('conflictos')
        .update({ 
          estado: 'activo',
          fecha_resolucion: null
        })
        .eq('id', conflictoActual.id);

      if (error) throw error;
      
      // Enviar mensaje de reapertura
      await supabase
        .from('mensajes_conflicto')
        .insert([
          {
            conflicto_id: conflictoActual.id,
            remitente: 'admin',
            contenido: 'Este conflicto ha sido reabierto por el administrador.',
            fecha: new Date().toISOString(),
            es_sistema: true
          }
        ]);
      
      toast.success('Conflicto reabierto');
      fetchConflictos();
      
      // Actualizar el conflicto actual
      setConflictoActual({
        ...conflictoActual,
        estado: 'activo',
        fecha_resolucion: null
      });
    } catch (error) {
      console.error('Error al reabrir conflicto:', error);
      toast.error('Error al reabrir el conflicto');
    }
  }

  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString();
  }

  function getEstadoColor(estado) {
    return estado === 'activo' ? 'bg-red-500' : 'bg-green-500';
  }

  function getTipoConflictoLabel(tipo) {
    switch (tipo) {
      case 'producto_danado': return 'Producto dañado';
      case 'retraso_envio': return 'Retraso en envío';
      case 'error_facturacion': return 'Error de facturación';
      case 'servicio_incompleto': return 'Servicio incompleto';
      default: return tipo;
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Resolución de Disputas</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setFiltro('todos')} 
          className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFiltro('activos')} 
          className={`px-4 py-2 rounded ${filtro === 'activos' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Activos
        </button>
        <button 
          onClick={() => setFiltro('resueltos')} 
          className={`px-4 py-2 rounded ${filtro === 'resueltos' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Resueltos
        </button>
      </div>

      {/* Vista dividida: Lista de conflictos y Chat */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de conflictos */}
        <div className={`${conflictoActual ? 'lg:w-1/3' : 'w-full'}`}>
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner"></div>
              <p>Cargando conflictos...</p>
            </div>
          ) : conflictos.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay conflictos {filtro !== 'todos' ? `en estado "${filtro}"` : ''}</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[70vh] bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold p-4 border-b">Conflictos</h2>
              <ul>
                {conflictos.map((conflicto) => (
                  <li 
                    key={conflicto.id} 
                    className={`border-b p-4 hover:bg-gray-50 cursor-pointer ${conflictoActual?.id === conflicto.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setConflictoActual(conflicto)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{conflicto.asunto}</h3>
                        <p className="text-sm text-gray-600">
                          Cliente: {conflicto.profiles?.nombre || conflicto.cliente_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tipo: {getTipoConflictoLabel(conflicto.tipo)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded text-white ${getEstadoColor(conflicto.estado)}`}>
                        {conflicto.estado}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatearFecha(conflicto.fecha_creacion)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Chat de conflicto */}
        {conflictoActual && (
          <div className="lg:w-2/3 bg-white rounded-lg shadow flex flex-col h-[70vh]">
            {/* Cabecera del chat */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{conflictoActual.asunto}</h2>
                <p className="text-sm text-gray-600">
                  Cliente: {conflictoActual.profiles?.nombre || conflictoActual.cliente_id} | 
                  Tipo: {getTipoConflictoLabel(conflictoActual.tipo)}
                </p>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs rounded text-white ${getEstadoColor(conflictoActual.estado)}`}>
                  {conflictoActual.estado}
                </span>
                {conflictoActual.estado === 'activo' ? (
                  <button
                    onClick={marcarComoResuelto}
                    className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Marcar como resuelto
                  </button>
                ) : (
                  <button
                    onClick={reabrirConflicto}
                    className="ml-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                  >
                    Reabrir
                  </button>
                )}
              </div>
            </div>
            
            {/* Detalles del conflicto */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Fecha de creación:</strong> {formatearFecha(conflictoActual.fecha_creacion)}</p>
                  {conflictoActual.fecha_resolucion && (
                    <p><strong>Fecha de resolución:</strong> {formatearFecha(conflictoActual.fecha_resolucion)}</p>
                  )}
                </div>
                <div>
                  <p><strong>Servicio relacionado:</strong> {conflictoActual.tipo_servicio}</p>
                  <p><strong>ID Servicio:</strong> {conflictoActual.servicio_id}</p>
                </div>
              </div>
              <div className="mt-2">
                <p><strong>Descripción:</strong></p>
                <p className="text-gray-700">{conflictoActual.descripcion}</p>
              </div>
            </div>
            
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensajes.map((mensaje) => {
                const esAdmin = mensaje.remitente === 'admin';
                const esSistema = mensaje.es_sistema;
                
                if (esSistema) {
                  return (
                    <div key={mensaje.id} className="text-center my-2">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        {mensaje.contenido}
                      </span>
                    </div>
                  );
                }
                
                return (
                  <div 
                    key={mensaje.id} 
                    className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${esAdmin ? 'bg-blue-100' : 'bg-gray-100'}`}
                    >
                      <p>{mensaje.contenido}</p>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {formatearFecha(mensaje.fecha)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={mensajesFinRef} />
            </div>
            
            {/* Formulario de envío de mensajes */}
            <form onSubmit={enviarMensaje} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 border rounded p-2"
                  placeholder="Escribe un mensaje..."
                  disabled={conflictoActual.estado === 'resuelto'}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={!nuevoMensaje.trim() || conflictoActual.estado === 'resuelto'}
                >
                  Enviar
                </button>
              </div>
              {conflictoActual.estado === 'resuelto' && (
                <p className="text-sm text-gray-500 mt-2">Este conflicto está resuelto. Reabre el conflicto para enviar mensajes.</p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}