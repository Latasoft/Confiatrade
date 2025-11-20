import { usePerfil, useLogout } from '../../auth/hooks/useAuth';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import { 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  FileText,
  LogOut
} from 'lucide-react';

export default function EmpresaDashboardPage() {
  const { data: perfil, isLoading } = usePerfil();
  const { data: empresasData } = useEmpresasAprobadas();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const empresa = perfil?.empresa;
  const empresaCompleta = empresasData?.find(e => e.id === empresa?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-white rounded-xl border-2 border-slate-300 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900">Dashboard de Empresa</h1>
              <p className="text-slate-700 mt-2 text-lg">
                Bienvenido, {perfil?.nombre_completo}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-lg border-2 border-slate-400 transition-colors flex items-center gap-2"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
            <div className="flex items-center gap-3">
              {empresa?.aprobada ? (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg border-2 border-emerald-400 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Empresa Aprobada
                </span>
              ) : (
                <span className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-lg border-2 border-amber-400 flex items-center gap-2">
                  <Clock size={20} />
                  Pendiente de Aprobación
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alerta si no está aprobada */}
        {!empresa?.aprobada && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Tu empresa está en proceso de revisión
              </h3>
              <p className="text-amber-800">
                Un administrador revisará la información de tu empresa pronto. Una vez aprobada, 
                podrás acceder a todos los eventos disponibles y agendar reuniones.
              </p>
            </div>
          </div>
        )}

        {/* Información de la Empresa */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-300">
            <Building2 className="text-blue-600" size={32} />
            <h2 className="text-2xl font-bold text-slate-900">Información de la Empresa</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">{empresa?.nombre}</h3>
              
              <div className="space-y-3">
                {empresa?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-slate-500" size={20} />
                    <span className="text-slate-700">{empresa.email}</span>
                  </div>
                )}
                
                {empresa?.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-slate-500" size={20} />
                    <span className="text-slate-700">{empresa.telefono}</span>
                  </div>
                )}
                
                {empresa?.sitio_web && (
                  <div className="flex items-center gap-3">
                    <Globe className="text-slate-500" size={20} />
                    <a 
                      href={empresa.sitio_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {empresa.sitio_web}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Detalles</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">País:</span>
                  <span className="font-semibold text-slate-800">País ID {empresa?.pais_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sector:</span>
                  <span className="font-semibold text-slate-800">Sector ID {empresa?.sector_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estado:</span>
                  <span className={`font-semibold ${empresa?.aprobada ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {empresa?.aprobada ? 'Aprobada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {empresaCompleta?.descripcion && (
            <div className="mt-6 pt-6 border-t-2 border-slate-300">
              <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={18} />
                Descripción
              </h4>
              <p className="text-slate-700">{empresaCompleta.descripcion}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500 rounded-xl">
                <Calendar className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Eventos Disponibles
                </p>
                <p className="text-4xl font-bold text-blue-900 mt-1">
                  {empresa?.aprobada ? '0' : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500 rounded-xl">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Reuniones Agendadas
                </p>
                <p className="text-4xl font-bold text-emerald-900 mt-1">
                  {empresa?.aprobada ? '0' : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-300 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500 rounded-xl">
                <CheckCircle className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Reuniones Completadas
                </p>
                <p className="text-4xl font-bold text-indigo-900 mt-1">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas funcionalidades */}
        {empresa?.aprobada && (
          <div className="bg-white rounded-xl border-2 border-slate-300 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Próximamente</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">📅 Ver Agenda de Reuniones</h3>
                <p className="text-sm text-slate-600">
                  Consulta y gestiona tus reuniones agendadas con otras empresas
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">🎯 Eventos Disponibles</h3>
                <p className="text-sm text-slate-600">
                  Explora eventos B2B y solicita participación
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">🤝 Matching de Empresas</h3>
                <p className="text-sm text-slate-600">
                  Encuentra empresas compatibles para hacer negocios
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">📊 Perfil de Curaduría</h3>
                <p className="text-sm text-slate-600">
                  Define qué ofreces y qué buscas en otros negocios
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
