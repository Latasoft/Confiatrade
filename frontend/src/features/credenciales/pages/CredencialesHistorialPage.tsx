import { useState } from 'react';
import { ArrowLeft, Calendar, Filter, FileText, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCredencialesHistorial } from '../hooks/useCredenciales';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';

export default function CredencialesHistorialPage() {
  const [page, setPage] = useState(0);
  const [tipoFiltro, setTipoFiltro] = useState<'empresa' | 'participante' | ''>('');
  const limit = 20;
  
  const { data, isLoading } = useCredencialesHistorial({
    skip: page * limit,
    limit,
    tipo: tipoFiltro || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-slate-100 to-white rounded-xl border-2 border-slate-300 shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/credenciales"
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Credenciales
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Historial de Credenciales
              </h1>
              <p className="text-slate-700 text-lg">
                Registro completo de todas las credenciales generadas
              </p>
            </div>
            {data && (
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{data.total}</p>
                <p className="text-sm text-slate-600">Total generadas</p>
              </div>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 shadow-md p-6">
          <div className="flex items-center gap-4">
            <Filter className="text-slate-600" size={20} />
            <label className="text-sm font-bold text-slate-800">Filtrar por tipo:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoFiltro('')}
                className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-colors ${
                  tipoFiltro === ''
                    ? 'bg-blue-500 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTipoFiltro('empresa')}
                className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-colors flex items-center gap-2 ${
                  tipoFiltro === 'empresa'
                    ? 'bg-blue-500 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Building2 size={16} />
                Empresas
              </button>
              <button
                onClick={() => setTipoFiltro('participante')}
                className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-colors flex items-center gap-2 ${
                  tipoFiltro === 'participante'
                    ? 'bg-blue-500 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <User size={16} />
                Participantes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Historial */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No hay historial"
            description="Aún no se han generado credenciales"
          />
        ) : (
          <>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 shadow-md overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-300 border-b-2 border-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                        Entidad
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                        Formato
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                        Fecha de Generación
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                        Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200">
                    {data.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-200 transition-colors">
                        <td className="px-6 py-4">
                          {item.tipo === 'empresa' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border-2 border-blue-300">
                              <Building2 size={14} />
                              Empresa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border-2 border-purple-300">
                              <User size={14} />
                              Participante
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.entidad?.nombre || 'N/A'}
                            </p>
                            {item.tipo === 'participante' && item.entidad?.empresa && (
                              <p className="text-xs text-slate-600">{item.entidad.empresa}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.entidad?.email || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-slate-300 text-slate-900">
                            {item.formato}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar size={16} />
                            <span className="text-sm">{formatFecha(item.fecha_generacion)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs text-slate-700 bg-slate-300 px-2 py-1 rounded">
                            {item.pdf_hash}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 shadow-md p-4">
                <p className="text-sm text-slate-700">
                  Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, data.total)} de{' '}
                  {data.total} registros
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border-2 border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded-lg border-2 border-blue-300">
                    Página {page + 1} de {totalPages}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border-2 border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
