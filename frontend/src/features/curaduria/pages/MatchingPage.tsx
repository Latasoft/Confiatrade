import { useState, useEffect } from 'react';
import { useMatches } from '../hooks/useCuraduria';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import { Search, TrendingUp, Users, Award } from 'lucide-react';
import { MatchCard } from '../components/MatchCard';

export default function MatchingPage() {
  const { data: empresas, isLoading: loadingEmpresas } = useEmpresasAprobadas();
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [minScore, setMinScore] = useState(0);

  // Seleccionar primera empresa cuando se carguen
  useEffect(() => {
    if (empresas && empresas.length > 0 && !selectedEmpresa) {
      setSelectedEmpresa(empresas[0].id);
    }
  }, [empresas, selectedEmpresa]);

  const { data, isLoading } = useMatches(selectedEmpresa, minScore);

  const matches = data?.matches || [];
  const total = data?.total || 0;

  const selectedEmpresaNombre =
    empresas?.find((e) => e.id === selectedEmpresa)?.nombre || '';

  if (loadingEmpresas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!empresas || empresas.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">No hay empresas aprobadas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Matching de Empresas</h1>
        <p className="text-gray-600 mt-1">
          Encuentra las mejores conexiones basadas en intereses complementarios
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 transition-all p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 border border-blue-200 rounded-xl">
              <Search className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Matches Totales</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl border-2 border-emerald-300 transition-all p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-xl">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Score Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {matches.length > 0
                  ? (matches.reduce((sum, m) => sum + m.score, 0) / matches.length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl border-2 border-purple-300 transition-all p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 border border-purple-200 rounded-xl">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sector Match</p>
              <p className="text-2xl font-bold text-gray-900">
                {matches.filter((m) => m.sector_match).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl border-2 border-amber-300 transition-all p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 border border-amber-200 rounded-xl">
              <Award className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mejor Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {matches.length > 0 ? Math.max(...matches.map((m) => m.score)) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-200 rounded-xl border-2 border-gray-400 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa Base
            </label>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {empresas?.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score Mínimo: {minScore}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Award size={16} className="text-blue-600" />
          <span>
            <strong>Algoritmo:</strong> +2 pts mismo sector | +1 pt por keyword match
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Matches List */}
      {!isLoading && matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Matches para <span className="text-blue-600">{selectedEmpresaNombre}</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => (
              <MatchCard key={match.empresa_b_id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && matches.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-2">No se encontraron matches</p>
          <p className="text-sm text-gray-400">
            Intenta reducir el score mínimo o verifica que existan curadurías configuradas
          </p>
        </div>
      )}
    </div>
  );
}
