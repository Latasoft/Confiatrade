import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/empresas', label: 'Empresas' },
  { path: '/participantes', label: 'Participantes' },
  { path: '/curaduria', label: 'Curaduría' },
  { path: '/agenda', label: 'Agenda B2B' },
  { path: '/credenciales', label: 'Credenciales' },
  { path: '/kpis', label: 'KPIs' },
  { path: '/seguimiento', label: 'Seguimiento' },
];

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">CT</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">ConfíaTrade</h1>
                  <p className="text-sm text-neutral-600">Conecta Empresas LATAM</p>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">Admin</span>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">A</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                    ${isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
