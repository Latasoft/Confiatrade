import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useCreateEvento, useUpdateEvento } from '../hooks/useEventos';
import type { Evento, CreateEventoData } from '../api/eventosApi';

interface EventoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  evento?: Evento | null;
}

export function EventoFormModal({ isOpen, onClose, evento }: EventoFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEventoData>({
    defaultValues: evento || {
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      ubicacion: '',
      pais_sede: 'Chile',
      capacidad_empresas: 50,
      estado: 'planificacion',
    },
  });

  const createEvento = useCreateEvento();
  const updateEvento = useUpdateEvento();

  useEffect(() => {
    if (evento) {
      reset({
        nombre: evento.nombre,
        descripcion: evento.descripcion || '',
        fecha_inicio: evento.fecha_inicio.split('T')[0],
        fecha_fin: evento.fecha_fin.split('T')[0],
        ubicacion: evento.ubicacion || '',
        pais_sede: evento.pais_sede,
        capacidad_empresas: evento.capacidad_empresas || 50,
        estado: evento.estado,
      });
    } else {
      reset({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        ubicacion: '',
        pais_sede: 'Chile',
        capacidad_empresas: 50,
        estado: 'planificacion',
      });
    }
  }, [evento, reset]);

  const onSubmit = async (data: CreateEventoData) => {
    try {
      // Asegurar que las fechas estén en formato correcto YYYY-MM-DD
      const eventoData = {
        ...data,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        // Asegurar que capacidad_empresas sea un número
        capacidad_empresas: data.capacidad_empresas || 50,
      };

      if (evento) {
        await updateEvento.mutateAsync({ id: evento.id, data: eventoData });
      } else {
        await createEvento.mutateAsync(eventoData);
      }
      reset();
      onClose();
    } catch (error) {
      // El error ya es manejado por el hook (onError)
      console.error('Error al guardar evento:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {evento ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Evento *
            </label>
            <input
              {...register('nombre', { required: 'El nombre es requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: Networking 2026"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              {...register('descripcion')}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del evento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio *
              </label>
              <input
                type="date"
                {...register('fecha_inicio', { required: 'La fecha de inicio es requerida' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_inicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin *
              </label>
              <input
                type="date"
                {...register('fecha_fin', { required: 'La fecha de fin es requerida' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.fecha_fin && (
                <p className="text-red-500 text-sm mt-1">{errors.fecha_fin.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              {...register('ubicacion')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: Santiago, Chile"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País Sede *
              </label>
              <select
                {...register('pais_sede', { required: 'El país es requerido' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Chile">Chile</option>
                <option value="Brasil">Brasil</option>
                <option value="Argentina">Argentina</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.pais_sede && (
                <p className="text-red-500 text-sm mt-1">{errors.pais_sede.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad Empresas
              </label>
              <input
                type="number"
                {...register('capacidad_empresas', { valueAsNumber: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              {...register('estado')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="planificacion">Planificación</option>
              <option value="inscripcion_abierta">Inscripción Abierta</option>
              <option value="en_curso">En Curso</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createEvento.isPending || updateEvento.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {createEvento.isPending || updateEvento.isPending
                ? 'Guardando...'
                : evento
                ? 'Actualizar'
                : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
