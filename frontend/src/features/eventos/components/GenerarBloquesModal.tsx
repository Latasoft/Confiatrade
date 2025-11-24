
import { X, Clock, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useGenerateBloques } from '@/features/agenda/hooks/useBloquesHorarios';
import type { GenerateBloqueRequest } from '@/features/agenda/api/bloquesHorariosApi';

interface GenerarBloquesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventoId: string;
  eventoNombre: string;
  fechaInicio: string;
  fechaFin: string;
}

export function GenerarBloquesModal({
  isOpen,
  onClose,
  eventoId,
  eventoNombre,
  fechaInicio,
  fechaFin,
}: GenerarBloquesModalProps) {
  const generateMutation = useGenerateBloques();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GenerateBloqueRequest>({
    defaultValues: {
      evento_id: eventoId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      hora_inicio: '09:00:00',
      hora_fin: '18:00:00',
      duracion_minutos: 60,
      label_prefijo: 'Bloque',
    },
  });

  const onSubmit = async (data: GenerateBloqueRequest) => {
    try {
      // Asegurar formato HH:MM:SS para las horas
      const formatTime = (time: string) => {
        if (!time) return time;
        return time.length === 5 ? `${time}:00` : time;
      };

      await generateMutation.mutateAsync({
        ...data,
        evento_id: eventoId,
        hora_inicio: formatTime(data.hora_inicio),
        hora_fin: formatTime(data.hora_fin),
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error al generar bloques:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <Clock size={28} />
              <div>
                <h2 className="text-2xl font-bold">Generar Bloques Horarios</h2>
                <p className="text-indigo-100 text-sm">{eventoNombre}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Los bloques horarios son los períodos de tiempo disponibles para agendar reuniones.
                Por ejemplo, si configuras de 9:00 a 18:00 con bloques de 60 minutos, se crearán 9 bloques horarios por día.
              </p>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  {...register('fecha_inicio', { required: 'Fecha inicio requerida' })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.fecha_inicio && (
                  <p className="text-sm text-red-600 mt-1">{errors.fecha_inicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Fecha Fin
                </label>
                <input
                  type="date"
                  {...register('fecha_fin', { required: 'Fecha fin requerida' })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.fecha_fin && (
                  <p className="text-sm text-red-600 mt-1">{errors.fecha_fin.message}</p>
                )}
              </div>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Hora Inicio Jornada
                </label>
                <input
                  type="time"
                  {...register('hora_inicio', { required: 'Hora inicio requerida' })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.hora_inicio && (
                  <p className="text-sm text-red-600 mt-1">{errors.hora_inicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Hora Fin Jornada
                </label>
                <input
                  type="time"
                  {...register('hora_fin', { required: 'Hora fin requerida' })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.hora_fin && (
                  <p className="text-sm text-red-600 mt-1">{errors.hora_fin.message}</p>
                )}
              </div>
            </div>

            {/* Duración y Prefijo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duración de cada bloque (minutos)
                </label>
                <select
                  {...register('duracion_minutos', { 
                    required: 'Duración requerida',
                    valueAsNumber: true 
                  })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                  <option value={90}>90 minutos (1.5 horas)</option>
                  <option value={120}>120 minutos (2 horas)</option>
                </select>
                {errors.duracion_minutos && (
                  <p className="text-sm text-red-600 mt-1">{errors.duracion_minutos.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prefijo de etiqueta
                </label>
                <input
                  type="text"
                  {...register('label_prefijo')}
                  placeholder="Ej: Bloque, Reunión, Slot"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ej: "Bloque 1", "Bloque 2", etc.
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Vista previa:</h4>
              <p className="text-sm text-gray-700">
                Se generarán bloques desde <strong>{fechaInicio}</strong> hasta <strong>{fechaFin}</strong>,
                cada día de <strong>09:00</strong> a <strong>18:00</strong> en intervalos de <strong>60 minutos</strong>.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Esto creará aproximadamente <strong>9 bloques por día</strong>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Clock size={20} />
                    Generar Bloques
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
