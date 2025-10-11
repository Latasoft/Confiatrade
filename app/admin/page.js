'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductGrid } from '@/components/ui/ProductGrid';

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
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // todos, disponible, agotado
  const [confirmarEliminacion, setConfirmarEliminacion] = useState({
    mostrar: false,
    productoId: null
  });

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
    setImagenArchivo(null);
    setVistaPrevia(null);
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
    setImagenArchivo(null);
    setVistaPrevia(producto.imagen_url || null);
    setModalAbierto(true);
  }

  function handleImagenChange(e) {
    const archivo = e.target.files[0];
    if (archivo) {
      // Validar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      setImagenArchivo(archivo);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setVistaPrevia(e.target.result);
      };
      reader.readAsDataURL(archivo);
    }
  }

  function convertirImagenABase64(archivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });
  }



  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precio) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }

    try {
      let imagenUrl = formData.imagen_url;
      
      // Si hay una nueva imagen seleccionada, convertirla a base64
      if (imagenArchivo) {
        try {
          imagenUrl = await convertirImagenABase64(imagenArchivo);
        } catch (error) {
          toast.error('Error al procesar la imagen');
          return;
        }
      }

      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        ubicacion: formData.ubicacion,
        proveedor: formData.proveedor,
        stock: parseInt(formData.stock) || 0,
        unidad: formData.unidad,
        estado: formData.estado,
        imagen_url: imagenUrl
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
      setImagenArchivo(null);
      setVistaPrevia(null);
      fetchProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error('Error al guardar el producto');
    }
  }

  function eliminarProducto(id) {
    setConfirmarEliminacion({
      mostrar: true,
      productoId: id
    });
  }

  async function confirmarEliminar() {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', confirmarEliminacion.productoId);

      if (error) throw error;
      
      toast.success('Producto eliminado correctamente');
      fetchProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
    }
    
    setConfirmarEliminacion({ mostrar: false, productoId: null });
  }

  function cancelarEliminar() {
    setConfirmarEliminacion({ mostrar: false, productoId: null });
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
    <div className="container mx-auto p-6">
      {/* Header con glass effect */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
              Gestión de Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Administra el catálogo de productos</p>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filtros con glass effect */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => setFiltro('todos')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'todos' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFiltro('disponible')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'disponible' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Disponibles
          </button>
          <button 
            onClick={() => setFiltro('agotado')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filtro === 'agotado' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/50'
            }`}
          >
            Agotados
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="glass rounded-xl p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="text-gray-600 dark:text-gray-300">No hay productos {filtro !== 'todos' ? `en estado "${filtro}"` : ''}</p>
        </div>
      ) : (
        <ProductGrid>
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onEdit={abrirEditar}
              onDelete={eliminarProducto}
              onStatusChange={cambiarEstado}
              showAdminActions={true}
            />
          ))}
        </ProductGrid>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Precio *</label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unidad</label>
                  <select
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="kg">Kilogramos</option>
                    <option value="tonelada">Toneladas</option>
                    <option value="litro">Litros</option>
                    <option value="unidad">Unidades</option>
                    <option value="caja">Cajas</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="agotado">Agotado</option>
                    <option value="descontinuado">Descontinuado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ubicación</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Proveedor</label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Imagen del Producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Formatos admitidos: JPG, PNG, GIF (máx. 5MB)</p>
                
                {/* Vista previa de la imagen */}
                {vistaPrevia && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa:</p>
                    <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={vistaPrevia}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVistaPrevia(null);
                          setImagenArchivo(null);
                          setFormData({ ...formData, imagen_url: '' });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {productoEditando ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalAbierto(false);
                    setImagenArchivo(null);
                    setVistaPrevia(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Moderno */}
      {confirmarEliminacion.mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              {/* Ícono y título */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Eliminar Producto
                </h3>
                <p className="text-gray-600">
                  ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
                </p>
              </div>
              
              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={cancelarEliminar}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminar}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}