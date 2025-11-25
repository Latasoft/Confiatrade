import { useState } from 'react';
import { Plus, Edit2, Trash2, Download, QrCode, Users } from 'lucide-react';
import {
  useMisParticipantes,
  useDeleteMiParticipante,
} from '../hooks/useEmpresaParticipantes';
import { useGenerarCredencialParticipante } from '../../credenciales/hooks/useCredenciales';
import { EmpresaParticipanteFormModal } from '../components/EmpresaParticipanteFormModal';
import type { MiParticipante } from '../api/empresaParticipantesApi';

export default function MisParticipantesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState<MiParticipante | undefined>();

  const { data, isLoading, isError } = useMisParticipantes();
  const deleteMutation = useDeleteMiParticipante();
  const generarCredencialMutation = useGenerarCredencialParticipante();

  const handleCreate = () => {
    setSelectedParticipante(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (participante: MiParticipante) => {
    setSelectedParticipante(participante);
    setIsModalOpen(true);
  };

  const handleDelete = async (participante: MiParticipante) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar a ${participante.nombre_completo}? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(participante.id);
      } catch (error) {
        console.error('Error al eliminar participante:', error);
        alert('Error al eliminar el participante. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleDescargarCredencial = (participanteId: string) => {
    generarCredencialMutation.mutate(participanteId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParticipante(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar los participantes. Por favor, intenta nuevamente.
      </div>
    );
  }

  const participantes = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600" />
            Mis Participantes
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los participantes de tu empresa para el evento
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Agregar Participante
        </button>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-medium">Total de Participantes</p>
            <p className="text-3xl font-bold text-blue-900">{participantes.length}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700 font-medium">Check-ins Realizados</p>
            <p className="text-3xl font-bold text-blue-900">
              {participantes.filter((p) => p.check_in_realizado).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700 font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-blue-900">
              {participantes.filter((p) => !p.check_in_realizado).length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Participantes */}
      {participantes.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay participantes registrados
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza agregando los participantes de tu empresa que asistirán al evento.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Agregar Primer Participante
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participantes.map((participante) => (
            <div
              key={participante.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              {/* Avatar y Nombre */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users size={24} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {participante.nombre_completo}
                  </h3>
                  {participante.cargo && (
                    <p className="text-sm text-gray-600 truncate">{participante.cargo}</p>
                  )}
                </div>
              </div>

              {/* Información */}
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="text-gray-500">Email:</span>
                  <p className="text-gray-900 truncate">{participante.email}</p>
                </div>
                {participante.telefono && (
                  <div className="text-sm">
                    <span className="text-gray-500">Teléfono:</span>
                    <p className="text-gray-900">{participante.telefono}</p>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-gray-500">Idioma:</span>
                  <span className="ml-2 text-gray-900">{participante.idioma}</span>
                  {participante.requiere_interprete && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Intérprete
                    </span>
                  )}
                </div>
              </div>

              {/* QR Badge */}
              {participante.qr_data && (
                <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <QrCode size={14} />
                    <span className="font-medium">QR generado</span>
                  </div>
                </div>
              )}

              {/* Check-in Status */}
              {participante.check_in_realizado ? (
                <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-700 font-medium">
                    Check-in realizado
                  </p>
                  {participante.fecha_check_in && (
                    <p className="text-xs text-green-600">
                      {new Date(participante.fecha_check_in).toLocaleString('es-CL')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-xs text-gray-600">Pendiente de check-in</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDescargarCredencial(participante.id)}
                  disabled={generarCredencialMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
                  title="Descargar Credencial"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={() => handleEdit(participante)}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(participante)}
                  disabled={deleteMutation.isPending}
                  className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <EmpresaParticipanteFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        participante={selectedParticipante}
      />
    </div>
  );
}
