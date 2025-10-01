'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    ubicacion: '',
    proveedor: '',
    stock: '',
    unidad: 'kg',
    estado: 'disponible',
    imagen_url: ''
  });
  const [filtro, setFiltro] = useState('todos'); // todos, disponible, agotado

  useEffect(() => {
    fetchProductos();
  }, [filtro]);

  async function fetchProductos() {
    try {
      setLoading(true);
      let query = supabase
        .from('productos')
        .select(`
          *,
          users:usuario_id (nombre, email)
        `);
      
      // Aplicar filtro
      if (filtro !== 'todos') {
        query = query.eq('estado', filtro);
      }
      
      const { data, error } = await query.order('fecha_creacion', { ascending: false });
      
      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  function abrirCrear() {
    setProductoEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      ubicacion: '',
      proveedor: '',
      stock: '',
      unidad: 'kg',
      estado: 'disponible',
      imagen_url: ''
    });
    setModalAbierto(true);
  }

  function abrirEditar(producto) {
    setProductoEditando(producto);
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || '',
      ubicacion: producto.ubicacion || '',
      proveedor: producto.proveedor || '',
      stock: producto.stock || '',
      unidad: producto.unidad || 'kg',
      estado: producto.estado || 'disponible',
      imagen_url: producto.imagen_url || ''
    });
    setModalAbierto(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precio) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }

    try {
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        ubicacion: formData.ubicacion,
        proveedor: formData.proveedor,
        stock: parseInt(formData.stock) || 0,
        unidad: formData.unidad,
        estado: formData.estado,
        imagen_url: formData.imagen_url
      };

      if (productoEditando) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('productos')
          .update(productData)
          .eq('id', productoEditando.id);

        if (error) throw error;
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('productos')
          .insert([productData]);

        if (error) throw error;
        toast.success('Producto creado correctamente');
      }

      setModalAbierto(false);
      fetchProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar el producto');
    }
  }

  async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Producto eliminado correctamente');
      fetchProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Producto marcado como ${nuevoEstado}`);
      fetchProductos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar el estado');
    }
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(precio);
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case 'disponible': return 'bg-green-500';
      case 'agotado': return 'bg-red-500';
      case 'descontinuado': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button 
          onClick={() => setFiltro('todos')} 
          className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFiltro('disponible')} 
          className={`px-4 py-2 rounded ${filtro === 'disponible' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Disponibles
        </button>
        <button 
          onClick={() => setFiltro('agotado')} 
          className={`px-4 py-2 rounded ${filtro === 'agotado' ? 'bg-blue-700 text-white' : 'bg-gray-200'}`}
        >
          Agotados
        </button>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay productos {filtro !== 'todos' ? `en estado "${filtro}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {producto.imagen_url && (
                <img 
                  src={producto.imagen_url} 
                  alt={producto.nombre}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                  <span className={`px-2 py-1 text-xs rounded text-white ${getEstadoColor(producto.estado)}`}>
                    {producto.estado}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
                
                <div className="space-y-1 text-sm text-gray-500">
                  <p><strong>Precio:</strong> {formatearPrecio(producto.precio)}</p>
                  <p><strong>Stock:</strong> {producto.stock} {producto.unidad}</p>
                  <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
                  <p><strong>Proveedor:</strong> {producto.proveedor}</p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => abrirEditar(producto)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    Editar
                  </button>
                  
                  {producto.estado === 'disponible' ? (
                    <button
                      onClick={() => cambiarEstado(producto.id, 'agotado')}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                    >
                      Marcar Agotado
                    </button>
                  ) : (
                    <button
                      onClick={() => cambiarEstado(producto.id, 'disponible')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Marcar Disponible
                    </button>
                  )}
                  
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio *</label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad</label>
                  <select
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="kg">Kilogramos</option>
                    <option value="tonelada">Toneladas</option>
                    <option value="litro">Litros</option>
                    <option value="unidad">Unidades</option>
                    <option value="caja">Cajas</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="agotado">Agotado</option>
                    <option value="descontinuado">Descontinuado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor</label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {productoEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}