import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, Filter, X } from 'lucide-react';
import { useInscripcionesPorEvento, useAprobarInscripcion, useRechazarInscripcion } from '../hooks/useInscripciones';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import type { EmpresaEvento } from '../api/inscripcionesApi';

interface InscripcionesEventoModalProps {
  eventoId: string;
  eventoNombre: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InscripcionesEventoModal({ eventoId, eventoNombre, isOpen, onClose }: InscripcionesEventoModalProps) {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Users size={28} />
              <div>
                <h2 className="text-2xl font-bold">Inscripciones</h2>
                <p className="text-blue-100 text-sm">{eventoNombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Inscripciones</p>
                    <p className="text-3xl font-bold text-slate-900">{total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 rounded-xl">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Pendientes</p>
                    <p className="text-3xl font-bold text-slate-900">{pendientes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Aprobadas</p>
                    <p className="text-3xl font-bold text-slate-900">{aprobadas}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <Filter size={20} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Filtrar por estado:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'todas'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Todas ({total})
                </button>
                <button
                  onClick={() => setFiltro('pendientes')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'pendientes'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Pendientes ({pendientes})
                </button>
                <button
                  onClick={() => setFiltro('aprobadas')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filtro === 'aprobadas'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Aprobadas ({aprobadas})
                </button>
              </div>
            </div>

            {/* Lista de inscripciones */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Cargando inscripciones..." />
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
                className="bg-slate-50 rounded-xl p-8 border border-slate-200"
              />
            ) : (
              <div className="space-y-3">
                {inscripciones.map((inscripcion) => (
                  <div
                    key={inscripcion.id}
                    className="bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-slate-900 text-lg">
                            {inscripcion.empresa_nombre || `Empresa ID: ${inscripcion.empresa_id.substring(0, 8)}...`}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getEstadoBadge(
                              inscripcion.aprobada
                            )}`}
                          >
                            {getEstadoTexto(inscripcion.aprobada)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Inscrita el {new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-CL', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {inscripcion.aprobada === null && (
                          <>
                            <button
                              onClick={() => handleAprobarClick(inscripcion)}
                              disabled={aprobarMutation.isPending}
                              className="px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <CheckCircle size={18} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRechazarClick(inscripcion)}
                              disabled={rechazarMutation.isPending}
                              className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <XCircle size={18} />
                              Rechazar
                            </button>
                          </>
                        )}

                        {inscripcion.aprobada === true && (
                          <button
                            onClick={() => handleRechazarClick(inscripcion)}
                            disabled={rechazarMutation.isPending}
                            className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <XCircle size={18} />
                            Revocar
                          </button>
                        )}

                        {inscripcion.aprobada === false && (
                          <button
                            onClick={() => handleAprobarClick(inscripcion)}
                            disabled={aprobarMutation.isPending}
                            className="px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <CheckCircle size={18} />
                            Aprobar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </>
  );
}
