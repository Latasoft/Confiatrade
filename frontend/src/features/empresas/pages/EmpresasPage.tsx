import { useEmpresas } from '../hooks/useEmpresas';
import { EmpresaCard } from '../components/EmpresaCard';

export function EmpresasPage() {
  const { data: empresas, isLoading, error } = useEmpresas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Cargando empresas...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Empresas Participantes
          </h1>
          <p className="text-neutral-600">
            Gestiona las empresas registradas para ConfíaTrade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas?.map((empresa) => (
            <EmpresaCard key={empresa.id} empresa={empresa} />
          ))}
        </div>

        {empresas?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No hay empresas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
