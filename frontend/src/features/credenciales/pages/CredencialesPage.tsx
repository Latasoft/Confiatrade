import { useState, useMemo } from 'react';
import { CreditCard, Download, Printer, Search, Filter, History } from 'lucide-react';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import { useEventos } from '@/features/eventos/hooks/useEventos';
import { useCredencialesStats, useGenerarCredencialEmpresa, useGenerarCredencialesBatch, useCredencialesHistorial } from '../hooks/useCredenciales';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function CredencialesPage() {
  const [selectedEvento, setSelectedEvento] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: empresasData, isLoading: loadingEmpresas } = useEmpresasAprobadas();
  const { data: eventosData } = useEventos();
  const { data: stats, isLoading: loadingStats } = useCredencialesStats();
  const { data: historialData } = useCredencialesHistorial({ tipo: 'empresa', limit: 1000 });
  const generarCredencial = useGenerarCredencialEmpresa();
  const generarBatch = useGenerarCredencialesBatch();

  const empresas = empresasData || [];
  const eventos = eventosData?.eventos || [];

  // Crear mapa de empresas con credencial generada
  const empresasConCredencial = useMemo(() => {
    if (!historialData?.items) return new Set();
    return new Set(historialData.items.map(item => item.entidad?.id).filter(Boolean));
  }, [historialData]);

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerarCredencial = async (empresaId: string) => {
    try {
      await generarCredencial.mutateAsync(empresaId);
    } catch (error) {
      console.error('Error generando credencial:', error);
      alert('Error al generar credencial');
    }
  };

  const handleImprimirTodas = async () => {
    if (empresas.length === 0) {
      alert('No hay empresas para generar credenciales');
      return;
    }
    
    try {
      const empresaIds = empresas.map(e => e.id);
      await generarBatch.mutateAsync(empresaIds);
    } catch (error) {
      console.error('Error generando credenciales batch:', error);
      alert('Error al generar credenciales');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-slate-100 to-white rounded-xl border-2 border-slate-300 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Credenciales
              </h1>
              <p className="text-slate-700 text-lg">
                Genera y gestiona las credenciales de los participantes
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/credenciales/historial"
                className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg border-2 border-slate-700 shadow-md transition-colors flex items-center gap-2"
              >
                <History size={20} />
                Ver Historial
              </Link>
              <button
                onClick={handleImprimirTodas}
                disabled={generarBatch.isPending || loadingEmpresas || empresas.length === 0}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generarBatch.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Printer size={20} />
                )}
                {generarBatch.isPending ? 'Generando...' : 'Imprimir Todas'}
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Buscar Empresa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Filtro por Evento */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Evento
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  value={selectedEvento}
                  onChange={(e) => setSelectedEvento(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                >
                  <option value="">Todos los eventos</option>
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-800 mb-1">Total Empresas</p>
                <p className="text-3xl font-bold text-blue-900">{empresas.length}</p>
              </div>
              <CreditCard className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300 shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-800 mb-1">Credenciales Generadas</p>
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <p className="text-3xl font-bold text-emerald-900">{stats?.credenciales_generadas || 0}</p>
                )}
              </div>
              <Download className="text-emerald-600" size={40} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-800 mb-1">Pendientes</p>
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <p className="text-3xl font-bold text-purple-900">{stats?.pendientes || 0}</p>
                )}
              </div>
              <Printer className="text-purple-600" size={40} />
            </div>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-300 border-b-2 border-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Empresa</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">País</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Sector</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Estado</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {filteredEmpresas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-slate-600 text-lg">No se encontraron empresas</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmpresas.map((empresa) => {
                    const tieneCredencial = empresasConCredencial.has(empresa.id);
                    return (
                      <tr key={empresa.id} className="hover:bg-slate-200 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{empresa.nombre}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{empresa.email || '-'}</td>
                        <td className="px-6 py-4 text-slate-700">-</td>
                        <td className="px-6 py-4 text-slate-700">-</td>
                        <td className="px-6 py-4">
                          {tieneCredencial ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border-2 border-emerald-300">
                              ✓ Generada
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border-2 border-amber-300">
                              ⌛ Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleGenerarCredencial(empresa.id)}
                              disabled={generarCredencial.isPending}
                              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-bold rounded-lg border-2 border-blue-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {generarCredencial.isPending ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <CreditCard size={16} />
                                  {tieneCredencial ? 'Re-generar' : 'Generar'}
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            💡 Información sobre Credenciales
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Las credenciales incluyen el nombre de la empresa, logo, y código QR único</li>
            <li>• Puedes generar credenciales individuales o todas a la vez</li>
            <li>• Los archivos se generan en formato PDF listo para imprimir</li>
            <li>• Solo las empresas aprobadas pueden tener credenciales</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
