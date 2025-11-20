import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCuradurias, useCreateCuraduria, useUpdateCuraduria, useDeleteCuraduria } from '../hooks/useCuraduria';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { Curaduria, CreateCuraduriaData } from '../api/curaduriaApi';

export default function CuraduriaPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading } = useCuradurias();
  const { data: empresasData, isLoading: isLoadingEmpresas } = useEmpresasAprobadas();
  const createCuraduria = useCreateCuraduria();
  const updateCuraduria = useUpdateCuraduria();
  const deleteCuraduria = useDeleteCuraduria();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCuraduriaData>();

  const curadurias = data?.curaduria || [];
  const empresas = empresasData || [];

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[CuraduriaPage] Loaded:', { curadurias: curadurias.length, empresas: empresas.length });
    }
  }, [curadurias.length, empresas.length]);

  const handleEdit = (curaduria: Curaduria) => {
    setEditingId(curaduria.id);
    setIsCreating(false);
    reset({
      empresa_id: curaduria.empresa_id,
      ofrece: curaduria.ofrece || '',
      busca: curaduria.busca || '',
      objetivos: curaduria.objetivos || '',
      capacidades: curaduria.capacidades || '',
      notas_internas: curaduria.notas_internas || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta curaduría?')) {
      await deleteCuraduria.mutateAsync(id);
    }
  };

  const onSubmit = async (formData: CreateCuraduriaData) => {
    try {
      if (editingId) {
        const { empresa_id, ...updateData } = formData;
        await updateCuraduria.mutateAsync({ id: editingId, data: updateData });
        setEditingId(null);
      } else {
        await createCuraduria.mutateAsync(formData);
        setIsCreating(false);
      }
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    reset();
  };

  const handleNewCuraduria = () => {
    setIsCreating(true);
    setEditingId(null);
    reset({
      empresa_id: empresas[0]?.id || '',
      ofrece: '',
      busca: '',
      objetivos: '',
      capacidades: '',
      notas_internas: '',
    });
  };

  if (isLoading || isLoadingEmpresas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 p-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Gestión de Curaduría</h1>
          <p className="text-slate-700 mt-2 text-lg">
            Configura qué ofrece y busca cada empresa para el matching
          </p>
        </div>
        <button
          onClick={handleNewCuraduria}
          disabled={empresas.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Plus size={22} />
          Nueva Curaduría
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6 space-y-4">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingId ? 'Editar Curaduría' : 'Nueva Curaduría'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {isCreating && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <select
                {...register('empresa_id', { required: 'La empresa es requerida' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {errors.empresa_id && (
                <p className="text-red-500 text-sm mt-1">{errors.empresa_id.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué Ofrece? (separado por comas)
              </label>
              <textarea
                {...register('ofrece')}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="logística internacional, transporte, almacenamiento"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keywords de productos/servicios que ofrece
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué Busca? (separado por comas)
              </label>
              <textarea
                {...register('busca')}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="software de gestión, tecnología de tracking"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keywords de productos/servicios que necesita
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objetivos de Participación
            </label>
            <textarea
              {...register('objetivos')}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Expandir operaciones a nuevos mercados..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidades
            </label>
            <textarea
              {...register('capacidades')}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Flota de 50 camiones, 3 centros de distribución..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Internas (solo visible para curadores)
            </label>
            <textarea
              {...register('notas_internas')}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Cliente premium - priorizar matches..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createCuraduria.isPending || updateCuraduria.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save size={16} />
              {createCuraduria.isPending || updateCuraduria.isPending
                ? 'Guardando...'
                : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {curadurias.map((curaduria) => (
          <div key={curaduria.id} className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 hover:border-blue-400 transition-all p-6">
            <div className="flex justify-between items-start mb-4 pb-4 border-b-2 border-slate-300">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {curaduria.empresa_nombre}
                </h3>
                <div className="flex gap-3 text-sm text-slate-600 mt-2">
                  {curaduria.empresa_sector && (
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-800 font-bold rounded-lg border-2 border-blue-300">
                      {curaduria.empresa_sector}
                    </span>
                  )}
                  {curaduria.empresa_pais && <span className="font-semibold">{curaduria.empresa_pais}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(curaduria)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(curaduria.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-2">Ofrece:</p>
                <p className="text-gray-600">{curaduria.ofrece || 'No especificado'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-2">Busca:</p>
                <p className="text-gray-600">{curaduria.busca || 'No especificado'}</p>
              </div>
            </div>

            {curaduria.objetivos && (
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium text-gray-700 text-sm mb-1">Objetivos:</p>
                <p className="text-sm text-gray-600">{curaduria.objetivos}</p>
              </div>
            )}
          </div>
        ))}

        {curadurias.length === 0 && !isCreating && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border-2 border-dashed border-gray-500 shadow-inner">
            <p className="text-gray-700 font-bold text-lg mb-6">No hay curadurías configuradas</p>
            <button
              onClick={handleNewCuraduria}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Crear primera curaduría
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
