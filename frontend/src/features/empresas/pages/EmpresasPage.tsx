import { useEffect, useState } from 'react';
import { useEmpresas } from '../hooks/useEmpresas';
import { EmpresaCard } from '../components/EmpresaCard';
import { EmpresaDetailsModal } from '../components/EmpresaDetailsModal';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Building2 } from 'lucide-react';
import type { Empresa } from '@/shared/types';

export function EmpresasPage() {
  const { data: empresas, isLoading, error } = useEmpresas();
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[EmpresasPage] Loaded empresas:', empresas?.length || 0);
    }
  }, [empresas?.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando empresas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error al cargar empresas</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl border-2 border-gray-400 p-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Empresas Participantes
          </h1>
          <p className="text-slate-700 text-lg">
            Gestiona las empresas registradas para ConfiaGlobal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas?.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              onSelect={(emp) => setSelectedEmpresa(emp)}
            />
          ))}
        </div>

        {empresas?.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No hay empresas registradas"
            description="Aún no se han registrado empresas en la plataforma"
          />
        )}
      </div>

      {selectedEmpresa && (
        <EmpresaDetailsModal
          empresa={selectedEmpresa}
          onClose={() => setSelectedEmpresa(null)}
        />
      )}
    </div>
  );
}
