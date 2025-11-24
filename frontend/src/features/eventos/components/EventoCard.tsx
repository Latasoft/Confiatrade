import { Evento } from '../api/eventosApi';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventoCardProps {
  evento: Evento;
  onInscribirse?: (eventoId: string) => void;
  inscribiendose?: boolean;
  showInscribirButton?: boolean;
}

export const EventoCard = ({ 
  evento, 
  onInscribirse, 
  inscribiendose = false,
  showInscribirButton = true 
}: EventoCardProps) => {
  const fechaInicio = new Date(evento.fecha_inicio);
  const fechaFin = new Date(evento.fecha_fin);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {evento.nombre}
        </h3>
        {evento.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {evento.descripcion}
          </p>
        )}
      </div>

      {/* Info Grid */}
      <div className="space-y-3 mb-4">
        {/* Fechas */}
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div>{format(fechaInicio, "d 'de' MMMM 'de' yyyy", { locale: es })}</div>
            {fechaInicio.toDateString() !== fechaFin.toDateString() && (
              <div className="text-gray-500">
                hasta {format(fechaFin, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>
            {(evento.ciudad_sede || evento.ubicacion) ? `${evento.ciudad_sede || evento.ubicacion}, ` : ''}{evento.pais_sede}
          </span>
        </div>

        {/* Capacidad */}
        {evento.capacidad_empresas && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>Capacidad: {evento.capacidad_empresas} empresas</span>
          </div>
        )}
      </div>

      {/* Footer con botón */}
      {showInscribirButton && onInscribirse && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onInscribirse(evento.id)}
            disabled={inscribiendose}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {inscribiendose ? 'Inscribiendo...' : 'Inscribirme'}
          </button>
        </div>
      )}
    </div>
  );
};
