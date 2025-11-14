import { Empresa } from '@/shared/types';
import { formatDate } from '@/shared/utils/format';

interface EmpresaCardProps {
  empresa: Empresa;
  onSelect?: (empresa: Empresa) => void;
}

export function EmpresaCard({ empresa, onSelect }: EmpresaCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(empresa)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{empresa.nombre}</h3>
          <p className="text-sm text-neutral-600 mt-1">{empresa.descripcion}</p>
        </div>
        {empresa.aprobada && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Aprobada
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-neutral-600">
        {empresa.email && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Email:</span>
            <span>{empresa.email}</span>
          </div>
        )}
        {empresa.telefono && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Teléfono:</span>
            <span>{empresa.telefono}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-medium">Registro:</span>
          <span>{formatDate(empresa.fecha_registro)}</span>
        </div>
      </div>
    </div>
  );
}
