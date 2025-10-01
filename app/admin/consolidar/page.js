'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function ConsolidarPage() {
  const supabase = useSupabase();
  const [cargasDisponibles, setCargasDisponibles] = useState([]);
  const [cargasSeleccionadas, setCargasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConsolidar, setModalConsolidar] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_estimada: '',
    vehiculo: '',
    notas: ''
  });

  useEffect(() => {
    fetchCargasDisponibles();
  }, []);

  async function fetchCargasDisponibles() {
    try {
      setLoading(true);
      // Obtener cargas aprobadas que aún no han sido consolidadas
      const { data, error } = await supabase
        .from('solicitudes_carga')
        .select('*')
        .eq('estado', 'aprobada')
        .is('carga_consolidada_id', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCargasDisponibles(data || []);
    } catch (error) {
      console.error('Error al cargar cargas disponibles:', error);
      toast.error('Error al cargar las cargas disponibles');
    } finally {
      setLoading(false);
    }
  }

  function toggleSeleccion(carga) {
    if (cargasSeleccionadas.some(c => c.id === carga.id)) {
      // Si ya está seleccionada, la quitamos
      setCargasSeleccionadas(cargasSeleccionadas.filter(c => c.id !== carga.id));
    } else {
      // Si no está seleccionada, la añadimos
      setCargasSeleccionadas([...cargasSeleccionadas, carga]);
    }
  }

  function abrirModalConsolidar() {
    if (cargasSeleccionadas.length < 2) {
      toast.error('Debes seleccionar al menos 2 cargas para consolidar');
      return;
    }
    setModalConsolidar(true);
  }

  function sonCompatibles(cargas) {
    // Verificar si las cargas tienen rutas compatibles (mismo origen y destino o rutas cercanas)
    const origenes = new Set(cargas.map(c => c.origen));
    const destinos = new Set(cargas.map(c => c.destino));
    
    // Simplificación: consideramos compatibles si tienen el mismo origen y destino
    // En una implementación real, se podría usar un servicio de geolocalización para verificar cercanía
    return origenes.size === 1 && destinos.size === 1;
  }

  async function crearCargaConsolidada() {
    try {
      if (!sonCompatibles(cargasSeleccionadas)) {
        toast.error('Las cargas seleccionadas no son compatibles para consolidación');
        return;
      }

      // Calcular peso y valor total
      const pesoTotal = cargasSeleccionadas.reduce((sum, carga) => sum + (parseFloat(carga.peso) || 0), 0);
      const valorTotal = cargasSeleccionadas.reduce((sum, carga) => sum + (parseFloat(carga.valor_declarado) || 0), 0);
      
      // Crear la carga consolidada
      const { data: cargaConsolidada, error: errorCreacion } = await supabase
        .from('cargas_consolidadas')
        .insert([
          {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            fecha_estimada: formData.fecha_estimada,
            vehiculo: formData.vehiculo,
            notas: formData.notas,
            peso_total: pesoTotal,
            valor_total: valorTotal,
            origen: cargasSeleccionadas[0].origen,
            destino: cargasSeleccionadas[0].destino,
            cantidad_cargas: cargasSeleccionadas.length,
            estado: 'pendiente_envio'
          }
        ])
        .select();

      if (errorCreacion) throw errorCreacion;

      // Actualizar las cargas individuales con el ID de la carga consolidada
      const cargaConsolidadaId = cargaConsolidada[0].id;
      
      for (const carga of cargasSeleccionadas) {
        const { error: errorActualizacion } = await supabase
          .from('solicitudes_carga')
          .update({ carga_consolidada_id: cargaConsolidadaId })
          .eq('id', carga.id);
        
        if (errorActualizacion) throw errorActualizacion;
      }
      
      toast.success('Carga consolidada creada correctamente');
      setModalConsolidar(false);
      setCargasSeleccionadas([]);
      fetchCargasDisponibles();
    } catch (error) {
      console.error('Error al crear carga consolidada:', error);
      toast.error('Error al crear la carga consolidada');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Consolidación de Cargas</h1>
      
      {/* Acciones */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="mr-2">Cargas seleccionadas: {cargasSeleccionadas.length}</span>
          {cargasSeleccionadas.length > 0 && (
            <button 
              onClick={() => setCargasSeleccionadas([])} 
              className="text-red-600 hover:underline"
            >
              Limpiar selección
            </button>
          )}
        </div>
        
        <button
          onClick={abrirModalConsolidar}
          disabled={cargasSeleccionadas.length < 2}
          className={`px-4 py-2 rounded ${cargasSeleccionadas.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          Crear Carga Compartida
        </button>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p>Cargando solicitudes disponibles...</p>
        </div>
      ) : cargasDisponibles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay cargas disponibles para consolidar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-lg bg-white">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">Seleccionar</th>
                <th className="p-2">ID</th>
                <th className="p-2">Cliente</th>
                <th className="p-2">Producto</th>
                <th className="p-2">Origen</th>
                <th className="p-2">Destino</th>
                <th className="p-2">Peso (kg)</th>
                <th className="p-2">Dimensiones</th>
                <th className="p-2">Fecha estimada</th>
              </tr>
            </thead>
            <tbody>
              {cargasDisponibles.map((carga) => {
                const isSelected = cargasSeleccionadas.some(c => c.id === carga.id);
                const isCompatible = cargasSeleccionadas.length === 0 || 
                  sonCompatibles([...cargasSeleccionadas, carga]);
                
                return (
                  <tr 
                    key={carga.id} 
                    className={`hover:bg-gray-50 text-center ${isSelected ? 'bg-blue-50' : ''} ${!isCompatible && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <td className="p-2">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSeleccion(carga)}
                        disabled={!isCompatible && !isSelected}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="p-2">{carga.id}</td>
                    <td className="p-2">{carga.cliente_nombre || carga.cliente_id}</td>
                    <td className="p-2">{carga.producto_nombre}</td>
                    <td className="p-2">{carga.origen}</td>
                    <td className="p-2">{carga.destino}</td>
                    <td className="p-2">{carga.peso}</td>
                    <td className="p-2">{carga.dimensiones}</td>
                    <td className="p-2">{carga.fecha_estimada}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear carga consolidada */}
      {modalConsolidar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Crear Carga Consolidada</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Cargas seleccionadas: {cargasSeleccionadas.length}</h3>
              <ul className="list-disc pl-5 mb-4">
                {cargasSeleccionadas.map(carga => (
                  <li key={carga.id}>
                    ID: {carga.id} - {carga.producto_nombre} ({carga.peso} kg) - Cliente: {carga.cliente_nombre || carga.cliente_id}
                  </li>
                ))}
              </ul>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Origen:</strong> {cargasSeleccionadas[0]?.origen}</p>
                  <p><strong>Destino:</strong> {cargasSeleccionadas[0]?.destino}</p>
                </div>
                <div>
                  <p><strong>Peso total:</strong> {cargasSeleccionadas.reduce((sum, carga) => sum + (parseFloat(carga.peso) || 0), 0)} kg</p>
                  <p><strong>Valor total:</strong> ${cargasSeleccionadas.reduce((sum, carga) => sum + (parseFloat(carga.valor_declarado) || 0), 0)}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Nombre de la carga consolidada</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="Ej: Consolidado Madrid-Barcelona 15/09"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Breve descripción de la carga consolidada"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1">Fecha estimada de envío</label>
                <input
                  type="date"
                  value={formData.fecha_estimada}
                  onChange={(e) => setFormData({...formData, fecha_estimada: e.target.value})}
                  className="w-full border rounded p-2"
                />
              </div>
              
              <div>
                <label className="block mb-1">Vehículo asignado</label>
                <input
                  type="text"
                  value={formData.vehiculo}
                  onChange={(e) => setFormData({...formData, vehiculo: e.target.value})}
                  className="w-full border rounded p-2"
                  placeholder="Ej: Camión refrigerado 3.5T"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-1">Notas adicionales</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Instrucciones especiales, requerimientos, etc."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalConsolidar(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              
              <button
                onClick={crearCargaConsolidada}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Crear Carga Consolidada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}