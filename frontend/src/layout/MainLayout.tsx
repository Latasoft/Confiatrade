import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../features/auth/store/authStore';
import { LogOut } from 'lucide-react';

const navItems = [
  // Items para Admin y Organizadores
  { path: '/empresas', label: 'Empresas', roles: ['admin', 'organizador'], permissions: ['empresas.ver'] },
  { path: '/eventos', label: 'Eventos', roles: ['admin', 'organizador'], permissions: ['eventos.ver'] },
  { path: '/participantes', label: 'Participantes', roles: ['admin', 'organizador'], permissions: ['participantes.ver'] },
  { path: '/credenciales', label: 'Credenciales', roles: ['admin', 'organizador'], permissions: ['credenciales.ver', 'credenciales.generar'] },
  { path: '/check-in-dashboard', label: 'Check-ins', roles: ['admin'], permissions: ['participantes.gestionar_checkin'] },
  { path: '/curaduria', label: 'Curaduría', roles: ['admin', 'organizador'], permissions: ['curaduria.ver', 'empresas.aprobar'] },
  { path: '/matching', label: 'Matching', roles: ['admin'], permissions: ['reuniones.gestionar_bloques'] },
  { path: '/agenda', label: 'Agenda B2B', roles: ['admin', 'organizador'], permissions: ['reuniones.ver'] },
  { path: '/validar-qr', label: 'Validar QR', roles: ['admin'], permissions: ['participantes.gestionar_checkin'] },
  { path: '/kpis', label: 'KPIs', roles: ['admin', 'organizador'], permissions: ['kpis.ver'] },
  { path: '/seguimiento', label: 'Seguimiento', roles: ['admin'], permissions: [] }, // Admin only
  { path: '/roles', label: 'Roles', roles: ['admin'], permissions: [] }, // Admin only
  { path: '/organizadores', label: 'Organizadores', roles: ['admin'], permissions: [] }, // Admin only
  
  // Items solo para Empresas
  { path: '/empresa/dashboard', label: 'Dashboard', roles: ['empresa'] },
  { path: '/empresa/participantes', label: 'Mis Participantes', roles: ['empresa'] },
  { path: '/empresa/agenda', label: 'Mi Agenda', roles: ['empresa'] },
];

export function MainLayout() {
  const location = useLocation();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  
  // Filtrar items de navegación según el rol y permisos del usuario
  const filteredNavItems = navItems.filter((item) => {
    if (!user) return false;
    
    // Si es admin, solo mostrar items que no sean específicos de empresa
    if (user.rol === 'admin') {
      return !item.roles.includes('empresa') || item.roles.includes('admin');
    }
    
    // Si es empresa, solo mostrar items para empresas
    if (user.rol === 'empresa') {
      return item.roles.includes('empresa');
    }
    
    // Para organizador u otros roles personalizados:
    // 1. No mostrar items específicos de empresa
    if (item.roles.includes('empresa') && item.roles.length === 1) {
      return false;
    }
    
    // 2. Si el item no requiere permisos específicos, solo admin puede verlo
    if (!('permissions' in item) || !item.permissions || item.permissions.length === 0) {
      return false;
    }
    
    // 3. Verificar que el usuario tenga TODOS los permisos requeridos
    return item.permissions.every(permission => 
      user.permisos?.includes(permission)
    );
  });

  console.log('[NAVBAR] Usuario:', user?.email, 'Rol:', user?.rol);
  console.log('[NAVBAR] Permisos del usuario:', user?.permisos);
  console.log('[NAVBAR] Items filtrados:', filteredNavItems.length);
  
  // Debug específico para credenciales
  const credencialesItem = navItems.find(item => item.path === '/credenciales');
  if (credencialesItem) {
    console.log('[NAVBAR] Item credenciales:', credencialesItem);
    console.log('[NAVBAR] Permisos requeridos:', credencialesItem.permissions);
    console.log('[NAVBAR] Tiene ver_credenciales?', user?.permisos?.includes('ver_credenciales'));
    console.log('[NAVBAR] Tiene generar_credenciales?', user?.permisos?.includes('generar_credenciales'));
  }

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
                    <p className="text-xs text-slate-300">
                      {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'organizador' ? 'Organizador' : user?.rol === 'empresa' ? 'Empresa' : 'Usuario'}
                    </p>
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

          <div className="flex gap-2 py-2 flex-wrap">
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
