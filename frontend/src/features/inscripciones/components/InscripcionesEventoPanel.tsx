import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, Filter } from 'lucide-react';
import { useInscripcionesPorEvento, useAprobarInscripcion, useRechazarInscripcion } from '../hooks/useInscripciones';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { EmpresaEvento } from '../api/inscripcionesApi';

interface InscripcionesEventoPanelProps {
  eventoId: string;
  eventoNombre: string;
}

export function InscripcionesEventoPanel({ eventoId, eventoNombre }: InscripcionesEventoPanelProps) {
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'aprobadas'>('todas');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    inscripcionId: string | null;
    accion: 'aprobar' | 'rechazar' | null;
    empresaNombre: string;
  }>({
    isOpen: false,
    inscripcionId: null,
    accion: null,
    empresaNombre: '',
  });

  const aprobadaParam = filtro === 'todas' ? undefined : filtro === 'aprobadas';
  const { data, isLoading } = useInscripcionesPorEvento(eventoId, aprobadaParam);
  
  const aprobarMutation = useAprobarInscripcion();
  const rechazarMutation = useRechazarInscripcion();

  const inscripciones = data?.inscripciones || [];
  const total = data?.total || 0;
  const aprobadas = data?.aprobadas || 0;
  const pendientes = data?.pendientes || 0;

  const handleAprobarClick = (inscripcion: EmpresaEvento) => {
    setConfirmDialog({
      isOpen: true,
      inscripcionId: inscripcion.id,
      accion: 'aprobar',
      empresaNombre: inscripcion.empresa_nombre || 'la empresa',
    });
  };

  const handleRechazarClick = (inscripcion: EmpresaEvento) => {
    setConfirmDialog({
      isOpen: true,
      inscripcionId: inscripcion.id,
      accion: 'rechazar',
      empresaNombre: inscripcion.empresa_nombre || 'la empresa',
    });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.inscripcionId || !confirmDialog.accion) return;

    try {
      if (confirmDialog.accion === 'aprobar') {
        await aprobarMutation.mutateAsync(confirmDialog.inscripcionId);
      } else {
        await rechazarMutation.mutateAsync(confirmDialog.inscripcionId);
      }
      setConfirmDialog({ isOpen: false, inscripcionId: null, accion: null, empresaNombre: '' });
    } catch (error) {
      console.error('Error al procesar inscripción:', error);
    }
  };

  const getEstadoBadge = (aprobada: boolean | null) => {
    if (aprobada === true) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (aprobada === false) {
      return 'bg-red-100 text-red-800 border-red-300';
    } else {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getEstadoTexto = (aprobada: boolean | null) => {
    if (aprobada === true) return 'Aprobada';
    if (aprobada === false) return 'Rechazada';
    return 'Pendiente';
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-300 p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Users className="text-blue-600" size={24} />
          Inscripciones: {eventoNombre}
        </h3>
        <p className="text-sm text-slate-600">
          Gestiona las empresas inscritas a este evento
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300 p-3">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={18} />
            <div>
              <p className="text-xs text-slate-600">Total</p>
              <p className="text-xl font-bold text-slate-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-300 p-3">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-600" size={18} />
            <div>
              <p className="text-xs text-slate-600">Pendientes</p>
              <p className="text-xl font-bold text-slate-900">{pendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-300 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-600" size={18} />
            <div>
              <p className="text-xs text-slate-600">Aprobadas</p>
              <p className="text-xl font-bold text-slate-900">{aprobadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex items-center gap-2">
        <Filter size={16} className="text-slate-600" />
        <span className="text-xs font-medium text-slate-700">Filtrar:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === 'todas'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Todas ({total})
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === 'pendientes'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Pendientes ({pendientes})
          </button>
          <button
            onClick={() => setFiltro('aprobadas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === 'aprobadas'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Aprobadas ({aprobadas})
          </button>
        </div>
      </div>

      {/* Lista de inscripciones con scroll */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Cargando inscripciones..." />
        </div>
      ) : inscripciones.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay inscripciones"
          description={
            filtro === 'todas'
              ? 'Aún no hay empresas inscritas a este evento'
              : filtro === 'pendientes'
              ? 'No hay inscripciones pendientes de aprobación'
              : 'No hay inscripciones aprobadas'
          }
          className="bg-slate-50 rounded-lg p-6"
        />
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {inscripciones.map((inscripcion) => (
            <div
              key={inscripcion.id}
              className="bg-slate-50 rounded-lg border border-slate-300 p-3 hover:border-blue-400 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {inscripcion.empresa_nombre || `Empresa ID: ${inscripcion.empresa_id.substring(0, 8)}...`}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-CL', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(
                      inscripcion.aprobada
                    )}`}
                  >
                    {getEstadoTexto(inscripcion.aprobada)}
                  </span>

                  {inscripcion.aprobada === null && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAprobarClick(inscripcion)}
                        disabled={aprobarMutation.isPending}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazarClick(inscripcion)}
                        disabled={rechazarMutation.isPending}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {inscripcion.aprobada && (
                    <button
                      onClick={() => handleRechazarClick(inscripcion)}
                      disabled={rechazarMutation.isPending}
                      className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
                    >
                      Desaprobar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, inscripcionId: null, accion: null, empresaNombre: '' })}
        onConfirm={handleConfirm}
        title={
          confirmDialog.accion === 'aprobar'
            ? 'Aprobar Inscripción'
            : 'Rechazar Inscripción'
        }
        message={
          confirmDialog.accion === 'aprobar'
            ? `¿Estás seguro de que deseas aprobar la inscripción de ${confirmDialog.empresaNombre}? La empresa podrá participar en el evento.`
            : `¿Estás seguro de que deseas rechazar la inscripción de ${confirmDialog.empresaNombre}? Esta acción se puede revertir después.`
        }
        confirmText={confirmDialog.accion === 'aprobar' ? 'Sí, aprobar' : 'Sí, rechazar'}
        cancelText="Cancelar"
        variant={confirmDialog.accion === 'aprobar' ? 'info' : 'warning'}
        isLoading={aprobarMutation.isPending || rechazarMutation.isPending}
      />
    </div>
  );
}
