import { useState } from 'react';
import { Calendar, Clock, MapPin, Filter, Plus } from 'lucide-react';
import { useReuniones, useDeleteReunion } from '../hooks/useReuniones';
import { useBloquesHorarios } from '../hooks/useBloquesHorarios';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import { ReunionModal } from '../components/ReunionModal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import type { Reunion } from '../api/reunionesApi';

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedSala, setSelectedSala] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReunion, setEditingReunion] = useState<Reunion | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reunionToDelete, setReunionToDelete] = useState<string | null>(null);

  const { data: reunionesData, isLoading: loadingReuniones } = useReuniones({
    fecha: selectedDate,
    empresa_id: selectedEmpresa || undefined,
    sala: selectedSala || undefined,
  });

  const { data: _bloquesData, isLoading: _loadingBloques } = useBloquesHorarios({
    fecha: selectedDate,
    activo: true,
  });

  const deleteMutation = useDeleteReunion();
  const { data: empresas, isLoading: loadingEmpresas } = useEmpresasAprobadas();

  const reuniones = reunionesData?.reuniones || [];

  // Calcular estadísticas
  const stats = {
    total: reuniones.length,
    programadas: reuniones.filter((r) => r.estado === 'programada').length,
    confirmadas: reuniones.filter((r) => r.estado === 'confirmada').length,
    realizadas: reuniones.filter((r) => r.estado === 'realizada').length,
  };

  const getEstadoBadge = (estado: string) => {
    const styles = {
      programada: 'bg-blue-100 text-blue-700',
      confirmada: 'bg-green-100 text-green-700',
      realizada: 'bg-gray-100 text-gray-700',
      cancelada: 'bg-red-100 text-red-700',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const handleEdit = (reunion: Reunion) => {
    setEditingReunion(reunion);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setReunionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (reunionToDelete) {
      await deleteMutation.mutateAsync(reunionToDelete);
      setDeleteDialogOpen(false);
      setReunionToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReunion(undefined);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda B2B</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las reuniones programadas entre empresas
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Nueva Reunión
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border-2 border-blue-300 shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg border-2 border-amber-300 shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.programadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg border-2 border-emerald-300 shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-lg border-2 border-gray-400 shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-gray-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.realizadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-200 rounded-lg border-2 border-gray-400 shadow-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <select
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingEmpresas}
              >
                <option value="">Todas las empresas</option>
                {empresas?.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sala
              </label>
              <input
                type="text"
                value={selectedSala}
                onChange={(e) => setSelectedSala(e.target.value)}
                placeholder="Filtrar por sala..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vista
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 px-3 py-2 rounded-lg transition ${
                    viewMode === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Calendario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loadingReuniones || _loadingBloques ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Cargando reuniones..." />
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-gray-200 rounded-lg border-2 border-gray-400 shadow-md">
          {reuniones.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No hay reuniones programadas"
              description="No se encontraron reuniones para esta fecha. Crea una nueva reunión para comenzar."
              action={
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Programar Primera Reunión
                </button>
              }
              className="p-12"
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {reuniones.map((reunion) => (
                <div key={reunion.id} className="p-6 bg-white hover:bg-blue-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadge(
                            reunion.estado
                          )}`}
                        >
                          {reunion.estado}
                        </span>
                        {reunion.sala && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={14} />
                            {reunion.sala}
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {reunion.empresa_a_nombre || 'N/A'}
                          </span>
                          <span className="text-gray-400">↔</span>
                          <span className="font-semibold text-gray-900">
                            {reunion.empresa_b_nombre || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} />
                          <span>
                            {reunion.bloque_hora_inicio} - {reunion.bloque_hora_fin}
                          </span>
                          {reunion.bloque_ubicacion && (
                            <>
                              <span className="text-gray-400">|</span>
                              <span>{reunion.bloque_ubicacion}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {reunion.notas && (
                        <p className="text-sm text-gray-600 mb-2">{reunion.notas}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(reunion)}
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(reunion.id)}
                        className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-600">Vista de calendario en desarrollo</p>
        </div>
      )}

      {/* Modal */}
      <ReunionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reunion={editingReunion}
        fecha={selectedDate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancelar Reunión"
        message="¿Estás seguro de que deseas cancelar esta reunión? Esta acción liberará el bloque horario para que pueda ser usado por otras reuniones."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
