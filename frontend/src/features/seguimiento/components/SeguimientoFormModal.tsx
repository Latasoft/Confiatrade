import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useCreateSeguimiento,
  useUpdateSeguimiento,
} from '../hooks/useSeguimiento';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import type {
  Seguimiento,
  CreateSeguimientoData,
} from '../api/seguimientoApi';

interface SeguimientoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  seguimiento?: Seguimiento;
}

export function SeguimientoFormModal({
  isOpen,
  onClose,
  seguimiento,
}: SeguimientoFormModalProps) {
  const createMutation = useCreateSeguimiento();
  const updateMutation = useUpdateSeguimiento();
  const { data: empresasData } = useEmpresasAprobadas();
  const empresas = empresasData || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSeguimientoData>({
    defaultValues: seguimiento
      ? {
          empresa_id: seguimiento.empresa_id,
          tipo: seguimiento.tipo,
          descripcion: seguimiento.descripcion,
          estado: seguimiento.estado,
          responsable: seguimiento.responsable || '',
          fecha_compromiso: seguimiento.fecha_compromiso?.split('T')[0] || '',
          notas: seguimiento.notas || '',
        }
      : {
          estado: 'pendiente',
          empresa_id: empresas[0]?.id || '',
        },
  });

  useEffect(() => {
    if (seguimiento) {
      reset({
        empresa_id: seguimiento.empresa_id,
        tipo: seguimiento.tipo,
        descripcion: seguimiento.descripcion,
        estado: seguimiento.estado,
        responsable: seguimiento.responsable || '',
        fecha_compromiso: seguimiento.fecha_compromiso?.split('T')[0] || '',
        notas: seguimiento.notas || '',
      });
    } else {
      reset({
        estado: 'pendiente',
        empresa_id: empresas[0]?.id || '',
      });
    }
  }, [seguimiento, reset, empresas]);

  const onSubmit = async (data: CreateSeguimientoData) => {
    try {
      // Convertir strings vacíos a undefined
      const submitData = {
        ...data,
        responsable: data.responsable || undefined,
        fecha_compromiso: data.fecha_compromiso || undefined,
        notas: data.notas || undefined,
      };

      if (seguimiento) {
        await updateMutation.mutateAsync({
          id: seguimiento.id,
          data: {
            tipo: submitData.tipo,
            descripcion: submitData.descripcion,
            estado: submitData.estado,
            responsable: submitData.responsable,
            fecha_compromiso: submitData.fecha_compromiso,
            notas: submitData.notas,
          },
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      handleClose();
    } catch (error) {
      console.error('Error al guardar seguimiento:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border-2 border-gray-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {seguimiento ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Registra acuerdos, LOIs o acciones de seguimiento
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa <span className="text-red-500">*</span>
            </label>
            <select
              {...register('empresa_id', { required: 'Empresa requerida' })}
              disabled={!!seguimiento}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Selecciona una empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
            {errors.empresa_id && (
              <p className="text-sm text-red-600 mt-1">{errors.empresa_id.message}</p>
            )}
          </div>

          {/* Tipo y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                {...register('tipo', { required: 'Tipo requerido' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona</option>
                <option value="acuerdo">Acuerdo</option>
                <option value="loi">LOI</option>
                <option value="seguimiento">Seguimiento</option>
              </select>
              {errors.tipo && (
                <p className="text-sm text-red-600 mt-1">{errors.tipo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                {...register('estado')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('descripcion', { required: 'Descripción requerida' })}
              placeholder="Describe el acuerdo o seguimiento..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.descripcion && (
              <p className="text-sm text-red-600 mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsable
            </label>
            <input
              type="text"
              {...register('responsable')}
              placeholder="Nombre del responsable"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Fecha Compromiso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Compromiso
            </label>
            <input
              type="date"
              {...register('fecha_compromiso')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              {...register('notas')}
              placeholder="Cualquier información adicional..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading
                ? 'Guardando...'
                : seguimiento
                ? 'Actualizar'
                : 'Crear Seguimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
