import { Link } from 'react-router-dom';
import { 
  BuildingOffice2Icon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

export function HomePage() {
  const features = [
    {
      name: 'Gestión de Empresas',
      description: 'Registro y administración de empresas participantes',
      icon: BuildingOffice2Icon,
      href: '/empresas',
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Participantes',
      description: 'Control de asistentes y representantes',
      icon: UsersIcon,
      href: '/participantes',
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Curaduría',
      description: 'Emparejamiento inteligente de empresas',
      icon: ClipboardDocumentCheckIcon,
      href: '/curaduria',
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Agenda B2B',
      description: 'Programación de reuniones de negocios',
      icon: CalendarDaysIcon,
      href: '/agenda',
      color: 'from-orange-500 to-orange-600',
    },
    {
      name: 'KPIs y Métricas',
      description: 'Seguimiento de indicadores de éxito',
      icon: ChartBarIcon,
      href: '/kpis',
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section con imagen de fondo */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              ConfiaGlobal
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Plataforma integral para la gestión de eventos B2B y encuentros empresariales internacionales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/empresas"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
              >
                Comenzar
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/kpis"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-700 transition-colors"
              >
                Ver Métricas
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor" className="text-gray-50"/>
          </svg>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas completas para organizar y gestionar encuentros empresariales exitosos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.name}
                to={feature.href}
                className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative p-8">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                    Acceder
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Empresas Participantes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Reuniones Agendadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
              <div className="text-gray-600">Países Representados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
