import { Empresa } from '@/shared/types';
import { formatDate } from '@/shared/utils/format';
import { useAprobarEmpresa, useRechazarEmpresa } from '../hooks/useEmpresas';
import { CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';

interface EmpresaCardProps {
  empresa: Empresa;
  onSelect?: (empresa: Empresa) => void;
}

export function EmpresaCard({ empresa, onSelect }: EmpresaCardProps) {
  const aprobarMutation = useAprobarEmpresa();
  const rechazarMutation = useRechazarEmpresa();

  const handleAprobar = (e: React.MouseEvent) => {
    e.stopPropagation();
    aprobarMutation.mutate(empresa.id);
  };

  const handleRechazar = (e: React.MouseEvent) => {
    e.stopPropagation();
    rechazarMutation.mutate(empresa.id);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 hover:border-blue-400 transition-all p-6">
      <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-slate-300">
        <div className="flex-1 cursor-pointer" onClick={() => onSelect?.(empresa)}>
          <h3 className="text-xl font-bold text-slate-900">{empresa.nombre}</h3>
          <p className="text-sm text-slate-700 mt-2 line-clamp-2">{empresa.descripcion}</p>
        </div>
        {empresa.aprobada ? (
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border-2 border-emerald-400 ml-4 whitespace-nowrap">
            Aprobada
          </span>
        ) : (
          <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border-2 border-amber-400 ml-4 whitespace-nowrap">
            Pendiente
          </span>
        )}
      </div>

      <div className="space-y-3 text-sm mb-4">
        {(empresa.pais?.nombre || empresa.pais_nombre) && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 min-w-[80px]">País:</span>
            <span className="text-slate-700">{empresa.pais?.nombre || empresa.pais_nombre}</span>
          </div>
        )}
        {(empresa.sector?.nombre || empresa.sector_nombre) && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 min-w-[80px]">Sector:</span>
            <span className="text-slate-700">{empresa.sector?.nombre || empresa.sector_nombre}</span>
          </div>
        )}
        {empresa.email && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 min-w-[80px]">Email:</span>
            <span className="text-slate-700">{empresa.email}</span>
          </div>
        )}
        {empresa.telefono && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 min-w-[80px]">Teléfono:</span>
            <span className="text-slate-700">{empresa.telefono}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 min-w-[80px]">Registro:</span>
          <span className="text-slate-700">{formatDate(empresa.fecha_registro)}</span>
        </div>
      </div>

      {/* Presentación PDF */}
      {empresa.presentacion_url && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-600" size={18} />
              <span className="text-sm font-bold text-blue-900">Presentación disponible</span>
            </div>
            <a
              href={empresa.presentacion_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition flex items-center gap-1"
            >
              <ExternalLink size={14} />
              Ver PDF
            </a>
          </div>
        </div>
      )}

      {/* Botones de aprobación/rechazo */}
      <div className="flex gap-2 pt-4 border-t-2 border-slate-300">
        {empresa.aprobada ? (
          <button
            onClick={handleRechazar}
            disabled={rechazarMutation.isPending}
            className="flex-1 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-bold rounded-lg border-2 border-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle size={18} />
            {rechazarMutation.isPending ? 'Procesando...' : 'Desaprobar'}
          </button>
        ) : (
          <button
            onClick={handleAprobar}
            disabled={aprobarMutation.isPending}
            className="flex-1 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm font-bold rounded-lg border-2 border-emerald-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={18} />
            {aprobarMutation.isPending ? 'Procesando...' : 'Aprobar'}
          </button>
        )}
      </div>
    </div>
  );
}
