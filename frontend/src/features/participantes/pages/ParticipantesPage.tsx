import { useState } from 'react';
import { Users, Search, Plus, QrCode, Mail, Phone } from 'lucide-react';
import { useParticipantes, useDeleteParticipante } from '../hooks/useParticipantes';
import { ParticipanteFormModal } from '../components/ParticipanteFormModal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import type { Participante } from '../api/participantesApi';

const IDIOMAS = [
  { value: 'ES', label: 'Español' },
  { value: 'EN', label: 'English' },
  { value: 'PT', label: 'Português' },
  { value: 'FR', label: 'Français' },
];

export default function ParticipantesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedIdioma, setSelectedIdioma] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipante, setEditingParticipante] = useState<Participante | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participanteToDelete, setParticipanteToDelete] = useState<string | null>(null);

  const { data: participantesData, isLoading } = useParticipantes({
    empresa_id: selectedEmpresa || undefined,
    idioma: selectedIdioma || undefined,
    search: searchTerm || undefined,
  });

  const { data: empresasData, isLoading: isLoadingEmpresas } = useEmpresasAprobadas();
  const deleteMutation = useDeleteParticipante();

  const participantes = participantesData?.participantes || [];
  const total = participantesData?.total || 0;
  const empresas = empresasData || [];

  // Filtrar por búsqueda local (adicional al backend)
  const filteredParticipantes = participantes.filter((p) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      p.nombre_completo.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      p.cargo?.toLowerCase().includes(search) ||
      p.empresa_nombre?.toLowerCase().includes(search)
    );
  });

  const handleEdit = (participante: Participante) => {
    setEditingParticipante(participante);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setParticipanteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (participanteToDelete) {
      await deleteMutation.mutateAsync(participanteToDelete);
      setDeleteDialogOpen(false);
      setParticipanteToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParticipante(undefined);
  };

  const getIdiomaLabel = (idioma: string) => {
    return IDIOMAS.find((i) => i.value === idioma)?.label || idioma;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Participantes</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los participantes registrados en los eventos
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
          >
            <Plus size={20} />
            Nuevo Participante
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 transition-all p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 border border-blue-200 rounded-xl">
              <Users className="text-blue-600" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participantes</p>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-500 mt-1">
                {filteredParticipantes.length !== total
                  ? `${filteredParticipantes.length} mostrados`
                  : 'Todos los registros'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-200 rounded-xl border-2 border-gray-400 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  placeholder="Nombre, email, cargo..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <select
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
                disabled={isLoadingEmpresas}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingEmpresas ? 'Cargando empresas...' : 'Todas las empresas'}
                </option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select
                value={selectedIdioma}
                onChange={(e) => setSelectedIdioma(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los idiomas</option>
                {IDIOMAS.map((idioma) => (
                  <option key={idioma.value} value={idioma.value}>
                    {idioma.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Cargando participantes..." />
        </div>
      ) : filteredParticipantes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron participantes"
          description="No hay participantes registrados o ninguno coincide con los filtros aplicados."
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Registrar Primer Participante
            </button>
          }
          className="bg-white rounded-lg shadow p-12"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipantes.map((participante) => (
            <div
              key={participante.id}
              className="bg-gray-200 rounded-xl border-2 border-gray-400 hover:border-blue-400 transition-all duration-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {participante.foto_url ? (
                    <img
                      src={participante.foto_url}
                      alt={participante.nombre_completo}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {participante.nombre_completo}
                    </h3>
                    {participante.cargo && (
                      <p className="text-sm text-gray-600">{participante.cargo}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  <QrCode size={12} />
                  QR
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  {participante.email}
                </div>
                {participante.telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    {participante.telefono}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Empresa:</span>{' '}
                  {participante.empresa_nombre || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Idioma:</span>{' '}
                  {getIdiomaLabel(participante.idioma)}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(participante)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(participante.id)}
                  className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ParticipanteFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        participante={editingParticipante}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Participante"
        message="¿Estás seguro de que deseas eliminar este participante? Se perderán todos sus datos de check-in y registros asociados. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
