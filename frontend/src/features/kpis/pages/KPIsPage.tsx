import { useState } from 'react';
import { useKPIsCurrent } from '../hooks/useKPIs';
import {
  Users,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  DollarSign,
} from 'lucide-react';

// Mock data para demostración (eliminar cuando el backend esté listo)
const MOCK_KPI_DATA = {
  total_empresas: 45,
  meta_empresas: 50,
  empresas_inscritas: 38,
  tasa_inscripcion: 84.4,
  total_reuniones: 120,
  reuniones_programadas: 85,
  reuniones_confirmadas: 65,
  reuniones_realizadas: 48,
  reuniones_canceladas: 7,
  tasa_realizacion: 73.8,
  total_bloques: 200,
  bloques_ocupados: 120,
  tasa_ocupacion: 60.0,
  total_seguimientos: 32,
  acuerdos_cerrados: 12,
  lois_firmadas: 8,
  monto_total_estimado: 2450000,
  total_participantes: 156,
  participantes_checkin: 138,
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function KPICard({ title, value, subtitle, icon, color, trend }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-gray-200 rounded-lg border-2 border-gray-400 p-6 hover:border-gray-500 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp size={16} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function KPIsPage() {
  const [useRealData] = useState(true); // Toggle para usar datos reales o mock

  // Hook para obtener datos reales del backend
  const { data: kpisResponse, isLoading } = useKPIsCurrent();

  const kpis = useRealData ? kpisResponse?.kpis : MOCK_KPI_DATA;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="p-8">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No hay datos de KPIs disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de KPIs</h1>
        <p className="text-gray-600 mt-2">
          Métricas y estadísticas del evento en tiempo real
        </p>
      </div>

      {/* Empresas Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Empresas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Empresas"
            value={kpis.total_empresas}
            subtitle={`Meta: ${kpis.meta_empresas}`}
            icon={<Users size={24} />}
            color="blue"
          />
          <KPICard
            title="Empresas Inscritas"
            value={kpis.empresas_inscritas}
            subtitle={`${kpis.tasa_inscripcion.toFixed(1)}% de inscripción`}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <KPICard
            title="Tasa de Inscripción"
            value={`${kpis.tasa_inscripcion.toFixed(1)}%`}
            subtitle={`${kpis.empresas_inscritas}/${kpis.total_empresas} empresas`}
            icon={<Target size={24} />}
            color="purple"
            trend={{
              value: 12.5,
              isPositive: true,
            }}
          />
          <KPICard
            title="Participantes"
            value={kpis.total_participantes}
            subtitle={`${kpis.participantes_checkin} con check-in`}
            icon={<Users size={24} />}
            color="blue"
          />
        </div>
      </div>

      {/* Reuniones Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reuniones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Total Reuniones"
            value={kpis.total_reuniones}
            icon={<Calendar size={24} />}
            color="blue"
          />
          <KPICard
            title="Programadas"
            value={kpis.reuniones_programadas}
            icon={<Clock size={24} />}
            color="orange"
          />
          <KPICard
            title="Confirmadas"
            value={kpis.reuniones_confirmadas}
            icon={<CheckCircle size={24} />}
            color="purple"
          />
          <KPICard
            title="Realizadas"
            value={kpis.reuniones_realizadas}
            subtitle={`${kpis.tasa_realizacion.toFixed(1)}% realización`}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <KPICard
            title="Canceladas"
            value={kpis.reuniones_canceladas}
            icon={<XCircle size={24} />}
            color="red"
          />
        </div>
      </div>

      {/* Ocupación Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ocupación</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Total Bloques"
            value={kpis.total_bloques}
            subtitle="Disponibles para reuniones"
            icon={<Calendar size={24} />}
            color="blue"
          />
          <KPICard
            title="Bloques Ocupados"
            value={kpis.bloques_ocupados}
            subtitle={`${kpis.tasa_ocupacion.toFixed(1)}% de ocupación`}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <KPICard
            title="Tasa de Ocupación"
            value={`${kpis.tasa_ocupacion.toFixed(1)}%`}
            subtitle={`${kpis.bloques_ocupados}/${kpis.total_bloques} bloques`}
            icon={<TrendingUp size={24} />}
            color="purple"
          />
        </div>
      </div>

      {/* Acuerdos Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acuerdos y Seguimiento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Seguimientos"
            value={kpis.total_seguimientos}
            icon={<FileText size={24} />}
            color="blue"
          />
          <KPICard
            title="Acuerdos Cerrados"
            value={kpis.acuerdos_cerrados}
            icon={<CheckCircle size={24} />}
            color="green"
          />
          <KPICard
            title="LOIs Firmadas"
            value={kpis.lois_firmadas}
            icon={<FileText size={24} />}
            color="purple"
          />
          <KPICard
            title="Monto Total Estimado"
            value={`$${(kpis.monto_total_estimado / 1000000).toFixed(1)}M`}
            subtitle="USD estimados en acuerdos"
            icon={<DollarSign size={24} />}
            color="green"
            trend={{
              value: 18.3,
              isPositive: true,
            }}
          />
        </div>
      </div>

      {/* Visual Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Evolución de Reuniones
        </h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            Gráfico de evolución (integrar Chart.js o Recharts)
          </p>
        </div>
      </div>
    </div>
  );
}
