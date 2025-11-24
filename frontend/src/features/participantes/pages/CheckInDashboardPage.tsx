import { useState, useMemo } from 'react';
import { useParticipantes } from '../hooks/useParticipantes';
import { UserCheck, Users, Clock, TrendingUp, Search, Download } from 'lucide-react';

export default function CheckInDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked' | 'pending'>('all');

  const { data, isLoading } = useParticipantes({ limit: 1000 });
  const participantes = data?.participantes || [];

  // Estadísticas
  const stats = useMemo(() => {
    const total = participantes.length;
    const checkedIn = participantes.filter((p) => p.check_in_realizado).length;
    const pending = total - checkedIn;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return { total, checkedIn, pending, percentage };
  }, [participantes]);

  // Filtrar participantes
  const filteredParticipantes = useMemo(() => {
    let filtered = participantes;

    // Filtrar por estado
    if (filterStatus === 'checked') {
      filtered = filtered.filter((p) => p.check_in_realizado);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter((p) => !p.check_in_realizado);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.empresa_nombre?.toLowerCase().includes(term)
      );
    }

    // Ordenar: con check-in primero (por fecha desc), sin check-in después
    return filtered.sort((a, b) => {
      if (a.check_in_realizado && !b.check_in_realizado) return -1;
      if (!a.check_in_realizado && b.check_in_realizado) return 1;
      if (a.check_in_realizado && b.check_in_realizado) {
        return new Date(b.fecha_check_in!).getTime() - new Date(a.fecha_check_in!).getTime();
      }
      return a.nombre_completo.localeCompare(b.nombre_completo);
    });
  }, [participantes, filterStatus, searchTerm]);

  // Gráfico por hora (últimas 24h)
  const checkInsByHour = useMemo(() => {
    const hourCounts: Record<string, number> = {};
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    participantes
      .filter((p) => p.check_in_realizado && p.fecha_check_in)
      .forEach((p) => {
        const checkInDate = new Date(p.fecha_check_in!);
        if (checkInDate >= last24h) {
          const hour = checkInDate.getHours();
          const key = `${hour.toString().padStart(2, '0')}:00`;
          hourCounts[key] = (hourCounts[key] || 0) + 1;
        }
      });

    return Object.entries(hourCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12); // Últimas 12 horas con datos
  }, [participantes]);

  const handleExport = () => {
    const csvData = filteredParticipantes.map((p) => ({
      Nombre: p.nombre_completo,
      Email: p.email,
      Empresa: p.empresa_nombre || 'N/A',
      'Check-in': p.check_in_realizado ? 'Sí' : 'No',
      'Fecha Check-in': p.fecha_check_in
        ? new Date(p.fecha_check_in).toLocaleString('es-CL')
        : 'N/A',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map((row) => headers.map((h) => `"${row[h as keyof typeof row]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `check-ins-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Check-Ins</h1>
          <p className="text-gray-600 mt-1">Monitoreo en tiempo real de asistencia</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Participantes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Con Check-in</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.checkedIn}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <UserCheck className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pendientes</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Porcentaje</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.percentage}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico simple de barras */}
      {checkInsByHour.length > 0 && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Check-ins por Hora (Últimas 24h)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {checkInsByHour.map(([hour, count]) => {
              const maxCount = Math.max(...checkInsByHour.map(([, c]) => c));
              const heightPercent = (count / maxCount) * 100;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs font-bold text-gray-700">{count}</div>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    title={`${hour}: ${count} check-ins`}
                  />
                  <div className="text-xs text-gray-500 mt-1">{hour}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro de estado */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('checked')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'checked'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Con Check-in ({stats.checkedIn})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({stats.pending})
          </button>
        </div>
      </div>

      {/* Tabla de participantes */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fecha Check-in
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredParticipantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron participantes
                  </td>
                </tr>
              ) : (
                filteredParticipantes.map((participante) => (
                  <tr key={participante.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{participante.nombre_completo}</div>
                      {participante.cargo && (
                        <div className="text-sm text-gray-500">{participante.cargo}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {participante.empresa_nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{participante.email}</td>
                    <td className="px-6 py-4 text-center">
                      {participante.check_in_realizado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <UserCheck size={14} />
                          Realizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <Clock size={14} />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {participante.fecha_check_in ? (
                        <div>
                          <div className="font-medium">
                            {new Date(participante.fecha_check_in).toLocaleDateString('es-CL')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(participante.fecha_check_in).toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer con contador */}
      <div className="text-center text-sm text-gray-600">
        Mostrando {filteredParticipantes.length} de {stats.total} participantes
      </div>
    </div>
  );
}
