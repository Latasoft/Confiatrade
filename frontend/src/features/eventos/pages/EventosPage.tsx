import { useState, useMemo, useEffect } from 'react';
import { useEventos, useDeleteEvento } from '../hooks/useEventos';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Clock } from 'lucide-react';
import { EventoFormModal } from '../components/EventoFormModal';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { InscripcionesEventoModal } from '@/features/inscripciones/components/InscripcionesEventoModal';
import { GenerarBloquesModal } from '../components/GenerarBloquesModal';
import type { Evento } from '../api/eventosApi';

export default function EventosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [activoFilter, setActivoFilter] = useState<boolean | undefined>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<string | null>(null);
  const [modalEventoId, setModalEventoId] = useState<string | null>(null);
  const [modalEventoNombre, setModalEventoNombre] = useState<string>('');
  const [bloquesModalOpen, setBloquesModalOpen] = useState(false);
  const [selectedEventoForBloques, setSelectedEventoForBloques] = useState<Evento | null>(null);

  // Stabilize filters object to prevent query key recreation
  const filters = useMemo(() => {
    return { activo: activoFilter };
  }, [activoFilter]);
  
  const { data, isLoading } = useEventos(filters);
  const deleteEvento = useDeleteEvento();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[EventosPage] Loaded eventos:', data?.eventos?.length || 0);
    }
  }, [data?.eventos?.length]);

  const handleEdit = (evento: Evento) => {
    setSelectedEvento(evento);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEventoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (eventoToDelete) {
      await deleteEvento.mutateAsync(eventoToDelete);
      setDeleteDialogOpen(false);
      setEventoToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvento(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando eventos..." />
      </div>
    );
  }

  const eventos = data?.eventos || [];
  const stats = {
    total: data?.total || 0,
    activos: data?.activos || 0,
    finalizados: data?.finalizados || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 p-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Eventos</h1>
          <p className="text-slate-700 mt-2 text-lg">Gestiona los eventos B2B de tu plataforma</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-semibold"
        >
          <Plus size={22} />
          Nuevo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 hover:border-blue-400 transition-all p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500 rounded-xl">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Eventos</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl border-2 border-emerald-300 hover:border-emerald-400 transition-all p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500 rounded-xl">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Activos</p>
              <p className="text-4xl font-bold text-emerald-900 mt-1">{stats.activos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 hover:border-gray-500 transition-all p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-500 rounded-xl">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Finalizados</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">{stats.finalizados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 p-6">
        <div className="flex gap-3">
          <button
            onClick={() => setActivoFilter(true)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activoFilter === true
                ? 'bg-blue-500 text-white scale-105'
                : 'bg-slate-50 text-slate-700 border-2 border-slate-400 hover:bg-slate-100 hover:border-blue-400'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setActivoFilter(undefined)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activoFilter === undefined
                ? 'bg-blue-500 text-white scale-105'
                : 'bg-slate-50 text-slate-700 border-2 border-slate-400 hover:bg-slate-100 hover:border-blue-400'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Eventos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <div key={evento.id} className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 hover:border-blue-400 hover:-translate-y-1 transition-all duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{evento.nombre}</h3>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                    evento.activo
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                      : 'bg-slate-200 text-slate-700 border-slate-400'
                  }`}
                >
                  {evento.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {evento.descripcion && (
                <p className="text-slate-700 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">{evento.descripcion}</p>
              )}

              <div className="space-y-3 text-sm text-slate-700 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-100 rounded-md border border-blue-200">
                    <Calendar size={14} className="text-blue-700" />
                  </div>
                  <span className="font-semibold">
                    {new Date(evento.fecha_inicio).toLocaleDateString()} -{' '}
                    {new Date(evento.fecha_fin).toLocaleDateString()}
                  </span>
                </div>
                {evento.ubicacion && (
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-100 rounded-md border border-indigo-200">
                      <MapPin size={14} className="text-indigo-700" />
                    </div>
                    <span className="font-semibold">{evento.ubicacion}</span>
                  </div>
                )}
                {evento.capacidad_empresas && (
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-100 rounded-md border border-emerald-200">
                      <Users size={14} className="text-emerald-700" />
                    </div>
                    <span className="font-semibold">{evento.capacidad_empresas} empresas</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setModalEventoId(evento.id);
                    setModalEventoNombre(evento.nombre);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 active:scale-95 transition-all font-semibold"
                >
                  <Users size={16} />
                  Inscripciones
                </button>
                <button
                  onClick={() => {
                    setSelectedEventoForBloques(evento);
                    setBloquesModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:scale-95 transition-all font-semibold"
                >
                  <Clock size={16} />
                  Generar Bloques Horarios
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(evento)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-semibold text-sm"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteClick(evento.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all font-semibold text-sm"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {eventos.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No hay eventos disponibles"
          description="Crea tu primer evento para comenzar a organizar reuniones B2B"
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Crear primer evento
            </button>
          }
        />
      )}

      <EventoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        evento={selectedEvento}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Evento"
        message="¿Estás seguro de que deseas eliminar este evento? Esta acción eliminará todas las reuniones, bloques horarios y participantes asociados. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteEvento.isPending}
      />

      {modalEventoId && (
        <InscripcionesEventoModal
          eventoId={modalEventoId}
          eventoNombre={modalEventoNombre}
          isOpen={true}
          onClose={() => setModalEventoId(null)}
        />
      )}

      {selectedEventoForBloques && (
        <GenerarBloquesModal
          isOpen={bloquesModalOpen}
          onClose={() => {
            setBloquesModalOpen(false);
            setSelectedEventoForBloques(null);
          }}
          eventoId={selectedEventoForBloques.id}
          eventoNombre={selectedEventoForBloques.nombre}
          fechaInicio={selectedEventoForBloques.fecha_inicio}
          fechaFin={selectedEventoForBloques.fecha_fin}
        />
      )}
      </div>
    </div>
  );
}
