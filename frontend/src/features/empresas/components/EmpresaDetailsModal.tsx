import { Empresa } from '@/shared/types';
import { X, Building2, Mail, Phone, Globe, MapPin, FileText, Download, Calendar, CheckCircle, XCircle, Users } from 'lucide-react';
import { formatDate } from '@/shared/utils/format';
import { useQuery } from '@tanstack/react-query';
import { empresasApi } from '../api/empresasApi';

interface EmpresaDetailsModalProps {
  empresa: Empresa;
  onClose: () => void;
}

export function EmpresaDetailsModal({ empresa, onClose }: EmpresaDetailsModalProps) {
  // Fetch detailed empresa data - always fresh data when modal opens
  const { data: empresaDetails, isLoading } = useQuery({
    queryKey: ['empresa-details', empresa.id],
    queryFn: () => empresasApi.getEmpresaDetails(empresa.id),
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
  });

  if (isLoading || !empresaDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-300">
        {/* Header */}
        <div className="sticky top-0 bg-blue-500 text-white px-6 py-4 flex items-center justify-between border-b-2 border-blue-600">
          <div className="flex items-center gap-3">
            <Building2 size={28} />
            <div>
              <h2 className="text-2xl font-bold">{empresaDetails.nombre}</h2>
              <p className="text-blue-100 text-sm">Información detallada de la empresa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado de Aprobación */}
          <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {empresaDetails.aprobada ? (
                  <>
                    <CheckCircle className="text-emerald-600" size={24} />
                    Estado: Aprobada
                  </>
                ) : (
                  <>
                    <XCircle className="text-amber-600" size={24} />
                    Estado: Pendiente de Aprobación
                  </>
                )}
              </h3>
              {empresaDetails.aprobada ? (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg border-2 border-emerald-400">
                  Aprobada
                </span>
              ) : (
                <span className="px-4 py-2 bg-amber-100 text-amber-800 font-bold rounded-lg border-2 border-amber-400">
                  ⏱ Pendiente
                </span>
              )}
            </div>
          </div>

          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="text-blue-600" size={20} />
              Información Básica
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase">Nombre</label>
                <p className="text-slate-900 font-medium mt-1">{empresaDetails.nombre}</p>
              </div>
              
              {empresaDetails.descripcion && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Descripción</label>
                  <p className="text-slate-900 mt-1">{empresaDetails.descripcion}</p>
                </div>
              )}

              {empresaDetails.pais && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 uppercase">País</label>
                  <p className="text-slate-900 font-medium mt-1">{empresaDetails.pais.nombre}</p>
                </div>
              )}

              {empresaDetails.sector && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Sector</label>
                  <p className="text-slate-900 font-medium mt-1">{empresaDetails.sector.nombre}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Mail className="text-blue-600" size={20} />
              Información de Contacto
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {empresaDetails.email && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                    <Mail size={14} />
                    Email
                  </label>
                  <p className="text-slate-900 font-medium mt-1">{empresaDetails.email}</p>
                </div>
              )}

              {empresaDetails.telefono && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                    <Phone size={14} />
                    Teléfono
                  </label>
                  <p className="text-slate-900 font-medium mt-1">{empresaDetails.telefono}</p>
                </div>
              )}

              {empresaDetails.sitio_web && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                    <Globe size={14} />
                    Sitio Web
                  </label>
                  <a
                    href={empresaDetails.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium mt-1 inline-flex items-center gap-1"
                  >
                    {empresaDetails.sitio_web}
                    <Download size={14} />
                  </a>
                </div>
              )}

              {empresaDetails.direccion && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                    <MapPin size={14} />
                    Dirección
                  </label>
                  <p className="text-slate-900 mt-1">{empresaDetails.direccion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Presentación PDF */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Presentación de la Empresa
            </h3>
            {empresaDetails.presentacion_url ? (
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={32} />
                    <div>
                      <p className="font-bold text-slate-900">Documento de Presentación</p>
                      <p className="text-sm text-slate-600">PDF disponible para descarga</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={empresaDetails.presentacion_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText size={16} />
                      Ver PDF
                    </a>
                    <a
                      href={empresaDetails.presentacion_url}
                      download
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                      Descargar
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                <div className="flex items-center gap-3">
                  <FileText className="text-slate-400" size={32} />
                  <div>
                    <p className="font-medium text-slate-700">No hay presentación disponible</p>
                    <p className="text-sm text-slate-500">La empresa aún no ha cargado su documento de presentación</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Participantes - si existen */}
          {empresaDetails.participantes && empresaDetails.participantes.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="text-blue-600" size={20} />
                Participantes ({empresaDetails.participantes.length})
              </h3>
              <div className="space-y-2">
                {empresaDetails.participantes.map((participante: any) => (
                  <div
                    key={participante.id}
                    className="bg-slate-50 rounded-lg p-3 border-2 border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{participante.nombre_completo}</p>
                      <p className="text-sm text-slate-600">{participante.email}</p>
                    </div>
                    {participante.cargo && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg">
                        {participante.cargo}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Información de Registro
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase">Fecha de Registro</label>
                <p className="text-slate-900 font-medium mt-1">{formatDate(empresaDetails.fecha_registro)}</p>
              </div>
              {empresaDetails.updated_at && (
                <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Última Actualización</label>
                  <p className="text-slate-900 font-medium mt-1">{formatDate(empresaDetails.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t-2 border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
