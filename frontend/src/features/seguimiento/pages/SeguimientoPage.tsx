import { useState, useMemo, useEffect } from 'react';
import {
  useSeguimientos,
  useDeleteSeguimiento,
} from '../hooks/useSeguimiento';
import { SeguimientoFormModal } from '../components/SeguimientoFormModal';
import type {
  Seguimiento,
  TipoSeguimiento,
  EstadoSeguimiento,
} from '../api/seguimientoApi';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
} from 'lucide-react';

const TIPOS: { value: TipoSeguimiento; label: string }[] = [
  { value: 'acuerdo', label: 'Acuerdo' },
  { value: 'loi', label: 'LOI' },
  { value: 'seguimiento', label: 'Seguimiento' },
];

const ESTADOS: { value: EstadoSeguimiento; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-2 border-amber-400 font-bold' },
  { value: 'en_proceso', label: 'En Proceso', color: 'bg-blue-100 text-blue-800 border-2 border-blue-400 font-bold' },
  { value: 'completado', label: 'Completado', color: 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-bold' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-slate-300 text-slate-800 border-2 border-slate-500 font-bold' },
];

export default function SeguimientoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeguimiento, setEditingSeguimiento] = useState<Seguimiento | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<TipoSeguimiento | ''>('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoSeguimiento | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Stabilize query params object to prevent infinite refetch loop
  const queryParams = useMemo(() => {
    console.log('[SeguimientoPage] Creating query params:', { tipo: selectedTipo || undefined, estado: selectedEstado || undefined });
    return {
      tipo: selectedTipo || undefined,
      estado: selectedEstado || undefined,
    };
  }, [selectedTipo, selectedEstado]);

  const { data: seguimientosData, isLoading } = useSeguimientos(queryParams);
  const deleteMutation = useDeleteSeguimiento();

  const seguimientos = seguimientosData?.seguimientos || [];

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[SeguimientoPage] Loaded seguimientos:', seguimientos.length);
    }
  }, [seguimientos.length]);

  // Filtro adicional por búsqueda en cliente
  const filteredSeguimientos = seguimientos.filter((seg) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seg.descripcion.toLowerCase().includes(searchLower) ||
      (seg.notas && seg.notas.toLowerCase().includes(searchLower))
    );
  });

  const handleEdit = (seguimiento: Seguimiento) => {
    setEditingSeguimiento(seguimiento);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este seguimiento?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setEditingSeguimiento(undefined);
    setIsModalOpen(false);
  };

  const getEstadoConfig = (estado: EstadoSeguimiento) => {
    return ESTADOS.find((e) => e.value === estado) || ESTADOS[0];
  };

  const getTipoIcon = (tipo: TipoSeguimiento) => {
    switch (tipo) {
      case 'acuerdo':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'loi':
        return <FileText size={20} className="text-blue-600" />;
      case 'seguimiento':
        return <Clock size={20} className="text-orange-600" />;
    }
  };

  // Calcular estadísticas
  const stats = {
    total: seguimientos.length,
    acuerdos: seguimientos.filter((s) => s.tipo === 'acuerdo').length,
    lois: seguimientos.filter((s) => s.tipo === 'loi').length,
    completados: seguimientos.filter((s) => s.estado === 'completado').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 p-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Seguimiento</h1>
          <p className="text-slate-700 mt-2 text-lg">
            Gestiona acuerdos, LOIs y seguimiento de empresas
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-semibold"
        >
          <Plus size={22} />
          Nuevo Seguimiento
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 transition-all p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <FileText className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl border-2 border-emerald-300 transition-all p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Acuerdos</p>
              <h3 className="text-3xl font-bold text-emerald-900 mt-1">{stats.acuerdos}</h3>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl">
              <CheckCircle className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl border-2 border-purple-300 transition-all p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">LOIs</p>
              <h3 className="text-3xl font-bold text-purple-900 mt-1">{stats.lois}</h3>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <FileText className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl border-2 border-teal-300 transition-all p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">Completados</p>
              <h3 className="text-3xl font-bold text-teal-900 mt-1">{stats.completados}</h3>
            </div>
            <div className="p-3 bg-teal-500 rounded-xl">
              <CheckCircle className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en descripción..."
                className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value as TipoSeguimiento | '')}
              className="w-full px-3 py-2.5 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 cursor-pointer"
            >
              <option value="">Todos</option>
              {TIPOS.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={selectedEstado}
              onChange={(e) =>
                setSelectedEstado(e.target.value as EstadoSeguimiento | '')
              }
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium cursor-pointer"
            >
              <option value="">Todos</option>
              {ESTADOS.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de seguimientos */}
      {filteredSeguimientos.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border-2 border-dashed border-gray-500 shadow-inner p-12 text-center">
          <div className="p-6 bg-white border-2 border-gray-300 rounded-2xl w-fit mx-auto mb-6">
            <FileText size={56} className="mx-auto text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No hay seguimientos registrados
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Comienza creando un nuevo seguimiento para las empresas
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus size={22} />
            Nuevo Seguimiento
          </button>
        </div>
      ) : (
        <div className="bg-gray-200 rounded-xl border-2 border-gray-400 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-300 border-b-2 border-gray-500">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Compromiso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-gray-200">
              {filteredSeguimientos.map((seguimiento) => {
                const estadoConfig = getEstadoConfig(seguimiento.estado);
                return (
                  <tr key={seguimiento.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {seguimiento.empresa_nombre || '-'}
                      </div>
                      {seguimiento.empresa_pais && (
                        <div className="text-xs text-gray-500">
                          {seguimiento.empresa_pais}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(seguimiento.tipo)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {seguimiento.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {seguimiento.descripcion}
                      </div>
                      {seguimiento.notas && (
                        <div className="text-sm text-gray-500 mt-1">
                          {seguimiento.notas}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs rounded-lg ${estadoConfig.color}`}
                      >
                        {estadoConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {seguimiento.responsable || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {seguimiento.fecha_compromiso 
                          ? new Date(seguimiento.fecha_compromiso).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(seguimiento)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(seguimiento.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SeguimientoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        seguimiento={editingSeguimiento}
      />
      </div>
    </div>
  );
}
