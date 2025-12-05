import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCreateReunion, useUpdateReunion, useReuniones } from '../hooks/useReuniones';
import { useBloquesHorarios } from '../hooks/useBloquesHorarios';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import type { Reunion, CreateReunionData } from '../api/reunionesApi';

interface ReunionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reunion?: Reunion;
  fecha?: string;
  eventoId?: string;
  preselectedEmpresas?: {
    empresa_a_id: string;
    empresa_b_id: string;
  };
}

export function ReunionModal({ isOpen, onClose, reunion, fecha, eventoId, preselectedEmpresas }: ReunionModalProps) {
  const [selectedFecha, setSelectedFecha] = useState<string>(
    fecha || reunion?.bloque_fecha || new Date().toISOString().split('T')[0]
  );

  const { data: bloquesData, isLoading: loadingBloques } = useBloquesHorarios(
    {
      fecha: selectedFecha,
      activo: true,
    },
    {
      enabled: !!selectedFecha,
    }
  );

  // Obtener reuniones de la fecha seleccionada para filtrar bloques ocupados
  const { data: reunionesData } = useReuniones({
    fecha: selectedFecha,
  });

  const { data: empresasData } = useEmpresasAprobadas(eventoId);
  const empresas = empresasData || [];

  const createMutation = useCreateReunion();
  const updateMutation = useUpdateReunion();
  
  // Filtrar bloques disponibles (sin reuniones o solo con la reunión actual si estamos editando)
  const bloquesDisponibles = useMemo(() => {
    const bloques = bloquesData?.bloques || [];
    const reuniones = reunionesData?.reuniones || [];
    
    // Crear un Set de IDs de bloques ocupados (excluyendo la reunión actual si estamos editando)
    const bloquesOcupados = new Set(
      reuniones
        .filter(r => !reunion || r.id !== reunion.id) // Excluir reunión actual
        .map(r => r.bloque_id)
    );
    
    // Retornar bloques que no están ocupados, o incluir el bloque actual si estamos editando
    return bloques.filter(b => 
      !bloquesOcupados.has(b.id) || (reunion && b.id === reunion.bloque_id)
    );
  }, [bloquesData, reunionesData, reunion]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateReunionData>({
    defaultValues: reunion
      ? {
          bloque_id: reunion.bloque_id,
          empresa_a_id: reunion.empresa_a_id,
          empresa_b_id: reunion.empresa_b_id,
          sala: reunion.sala || '',
          notas: reunion.notas || '',
          estado: reunion.estado,
        }
      : preselectedEmpresas
      ? {
          empresa_a_id: preselectedEmpresas.empresa_a_id,
          empresa_b_id: preselectedEmpresas.empresa_b_id,
          estado: 'programada',
        }
      : {
          estado: 'programada',
        },
  });

  const empresa_a_id = watch('empresa_a_id');

  useEffect(() => {
    if (reunion) {
      reset({
        bloque_id: reunion.bloque_id,
        empresa_a_id: reunion.empresa_a_id,
        empresa_b_id: reunion.empresa_b_id,
        sala: reunion.sala || '',
        notas: reunion.notas || '',
        estado: reunion.estado,
      });
    } else if (preselectedEmpresas) {
      reset({
        empresa_a_id: preselectedEmpresas.empresa_a_id,
        empresa_b_id: preselectedEmpresas.empresa_b_id,
        estado: 'programada',
      });
    }
  }, [reunion, preselectedEmpresas, reset]);

  const onSubmit = async (data: CreateReunionData) => {
    try {
      if (reunion) {
        await updateMutation.mutateAsync({
          id: reunion.id,
          data: {
            bloque_id: data.bloque_id,
            sala: data.sala,
            notas: data.notas,
            estado: data.estado,
          },
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      
      // Solo si llegamos aquí (éxito), cerramos el modal
      reset();
      onClose();
    } catch (error) {
      // El error ya fue manejado por el onError del mutation
      // Solo prevenir que cierre el modal
      console.error('Error en reunión:', error);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {reunion ? 'Editar Reunión' : 'Nueva Reunión'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Fecha selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              {reunion 
                ? 'Cambia la fecha para ver bloques de otros días'
                : 'Selecciona la fecha para ver bloques disponibles'
              }
            </p>
          </div>

          {/* Bloque Horario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bloque Horario <span className="text-red-500">*</span>
            </label>
            {loadingBloques ? (
              <div className="text-sm text-gray-500">Cargando bloques...</div>
            ) : bloquesDisponibles.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                No hay bloques horarios disponibles para la fecha seleccionada.
                {!reunion && ' Cambia la fecha o crea bloques primero.'}
                {reunion && ' Todos los bloques de esta fecha están ocupados.'}
              </div>
            ) : null}
            <select
              {...register('bloque_id', { required: 'Bloque horario requerido' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              disabled={bloquesDisponibles.length === 0}
            >
              <option value="">Selecciona un bloque horario</option>
              {bloquesDisponibles.map((bloque) => (
                <option key={bloque.id} value={bloque.id}>
                  {bloque.label} ({bloque.hora_inicio} - {bloque.hora_fin})
                </option>
              ))}
            </select>
            {errors.bloque_id && (
              <p className="text-sm text-red-600 mt-1">{errors.bloque_id.message}</p>
            )}
          </div>

          {/* Empresas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa A <span className="text-red-500">*</span>
              </label>
              <select
                {...register('empresa_a_id', { required: 'Empresa A requerida' })}
                disabled={!!reunion || !!preselectedEmpresas}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecciona empresa A</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {errors.empresa_a_id && (
                <p className="text-sm text-red-600 mt-1">{errors.empresa_a_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa B <span className="text-red-500">*</span>
              </label>
              <select
                {...register('empresa_b_id', {
                  required: 'Empresa B requerida',
                  validate: (value) =>
                    value !== empresa_a_id || 'Las empresas deben ser diferentes',
                })}
                disabled={!!reunion || !!preselectedEmpresas}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecciona empresa B</option>
                {empresas.filter((e) => e.id !== empresa_a_id).map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {errors.empresa_b_id && (
                <p className="text-sm text-red-600 mt-1">{errors.empresa_b_id.message}</p>
              )}
            </div>
          </div>

          {/* Sala */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sala</label>
            <input
              type="text"
              {...register('sala')}
              placeholder="Ej: Sala 1, Sala VIP, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              {...register('estado')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="programada">Programada</option>
              <option value="confirmada">Confirmada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea
              {...register('notas')}
              rows={3}
              placeholder="Notas adicionales sobre la reunión..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
              {isLoading ? 'Guardando...' : reunion ? 'Actualizar' : 'Crear Reunión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
