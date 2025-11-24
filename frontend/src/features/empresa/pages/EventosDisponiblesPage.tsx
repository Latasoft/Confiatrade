import { useState } from 'react';
import { useEventosDisponibles, useInscribirseEvento } from '@/features/eventos/hooks/useEventosEmpresa';
import { EventoCard } from '@/features/eventos/components/EventoCard';
import { Loader2, Target, AlertCircle } from 'lucide-react';

export const EventosDisponiblesPage = () => {
  const [paisFilter, setPaisFilter] = useState<string>('');
  
  const { data: eventos = [], isLoading, error } = useEventosDisponibles({
    pais_sede: paisFilter || undefined,
  });

  const inscribirseMutation = useInscribirseEvento();

  const handleInscribirse = (eventoId: string) => {
    if (confirm('¿Estás seguro de que deseas inscribirte a este evento? Tu solicitud será revisada por el administrador.')) {
      inscribirseMutation.mutate(eventoId);
    }
  };

  // Obtener lista única de países
  const paises = eventos ? Array.from(new Set(eventos.map(e => e.pais_sede))).sort() : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error al cargar eventos</h3>
            <p className="text-sm text-red-700 mt-1">
              {error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Eventos Disponibles</h1>
        </div>
        <p className="text-gray-600">
          Inscríbete a los eventos de networking y ruedas de negocios disponibles
        </p>
      </div>

      {/* Filtros */}
      {paises.length > 1 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por país
          </label>
          <select
            value={paisFilter}
            onChange={(e) => setPaisFilter(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los países</option>
            {paises.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>
      )}

      {/* Grid de eventos */}
      {eventos && eventos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map(evento => (
            <EventoCard
              key={evento.id}
              evento={evento}
              onInscribirse={handleInscribirse}
              inscribiendose={inscribirseMutation.isPending}
              showInscribirButton={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay eventos disponibles
          </h3>
          <p className="text-gray-600">
            {paisFilter 
              ? 'No se encontraron eventos para el país seleccionado. Intenta con otro filtro.'
              : 'No hay eventos con inscripciones abiertas en este momento. Vuelve a consultar más tarde.'}
          </p>
        </div>
      )}
    </div>
  );
};
