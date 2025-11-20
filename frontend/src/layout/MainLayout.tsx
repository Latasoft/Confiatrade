import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../features/auth/store/authStore';
import { LogOut } from 'lucide-react';

const navItems = [
  { path: '/empresas', label: 'Empresas', roles: ['admin'] },
  { path: '/eventos', label: 'Eventos', roles: ['admin'] },
  { path: '/participantes', label: 'Participantes', roles: ['admin'] },
  { path: '/curaduria', label: 'Curaduría', roles: ['admin'] },
  { path: '/matching', label: 'Matching', roles: ['admin'] },
  { path: '/agenda', label: 'Agenda B2B', roles: ['admin', 'empresa'] },
  { path: '/empresa/agenda', label: 'Mi Agenda', roles: ['empresa'] },
  { path: '/empresa/dashboard', label: 'Dashboard', roles: ['empresa'] },
  { path: '/credenciales', label: 'Credenciales', roles: ['admin'] },
  { path: '/kpis', label: 'KPIs', roles: ['admin'] },
  { path: '/seguimiento', label: 'Seguimiento', roles: ['admin'] },
];

export function MainLayout() {
  const location = useLocation();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  
  // Filtrar items de navegación según el rol del usuario
  const filteredNavItems = navItems.filter((item) => 
    user && item.roles.includes(user.rol as 'admin' | 'empresa')
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b-2 border-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">CG</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ConfiaGlobal</h1>
                  <p className="text-sm text-slate-300">Conecta Empresas LATAM</p>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{user?.nombre_completo || 'Usuario'}</p>
                    <p className="text-xs text-slate-300">{user?.rol === 'admin' ? 'Administrador' : 'Empresa'}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.nombre_completo?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 text-red-400 hover:text-white hover:bg-red-600 rounded-lg border-2 border-red-500 transition-all duration-200"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 py-2 overflow-x-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-200 hover:bg-slate-600 hover:text-white'
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
