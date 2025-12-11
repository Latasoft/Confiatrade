import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { EmpresasPage } from './features/empresas/pages/EmpresasPage';
import { HomePage } from './features/home/pages/HomePage';
import EventosPage from './features/eventos/pages/EventosPage';
import CuraduriaPage from './features/curaduria/pages/CuraduriaPage';
import MatchingPage from './features/curaduria/pages/MatchingPage';
import AgendaPage from './features/agenda/pages/AgendaPage';
import ParticipantesPage from './features/participantes/pages/ParticipantesPage';
import CheckInDashboardPage from './features/participantes/pages/CheckInDashboardPage';
import KPIsPage from './features/kpis/pages/KPIsPage';
import SeguimientoPage from './features/seguimiento/pages/SeguimientoPage';
import CredencialesPage from './features/credenciales/pages/CredencialesPage';
import CredencialesHistorialPage from './features/credenciales/pages/CredencialesHistorialPage';
import ValidarQRPage from './features/credenciales/pages/ValidarQRPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegistroPage from './features/auth/pages/RegistroPage';
import EmpresaDashboardPage from './features/empresa/pages/EmpresaDashboardPage';
import MisParticipantesPage from './features/empresa/pages/MisParticipantesPage';
import { EventosDisponiblesPage } from './features/empresa/pages/EventosDisponiblesPage';
import { RolesPage } from './features/roles/pages/RolesPage';
import { OrganizadoresPage } from './features/roles/pages/OrganizadoresPage';
import { ProtectedRoute, PublicRoute } from './features/auth/components/ProtectedRoute';
import { PermissionGuard } from './features/auth/components/PermissionGuard';

export const router = createBrowserRouter([
  // Rutas públicas (login, registro)
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/registro',
        element: <RegistroPage />,
      },
    ],
  },

  // Rutas protegidas para empresas
  {
    element: <ProtectedRoute allowedRoles={['empresa']} />,
    children: [
      {
        path: '/empresa',
        element: <MainLayout />,
        children: [
          {
            path: 'dashboard',
            element: <EmpresaDashboardPage />,
          },
          {
            path: 'participantes',
            element: <MisParticipantesPage />,
          },
          {
            path: 'eventos',
            element: <EventosDisponiblesPage />,
          },
          {
            path: 'agenda',
            element: <AgendaPage />,
          },
        ],
      },
    ],
  },

  // Rutas protegidas para administradores y organizadores
  {
    element: <ProtectedRoute allowedRoles={['admin', 'organizador']} />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'empresas',
            element: (
              <PermissionGuard permissions={['empresas.ver']}>
                <EmpresasPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'eventos',
            element: (
              <PermissionGuard permissions={['eventos.ver']}>
                <EventosPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'participantes',
            element: (
              <PermissionGuard permissions={['participantes.ver']}>
                <ParticipantesPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'check-in-dashboard',
            element: (
              <PermissionGuard permissions={['participantes.gestionar_checkin']}>
                <CheckInDashboardPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'curaduria',
            element: (
              <PermissionGuard permissions={['curaduria.ver', 'empresas.aprobar']} requireAll={true}>
                <CuraduriaPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'matching',
            element: (
              <PermissionGuard permissions={['reuniones.gestionar_bloques']}>
                <MatchingPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'agenda',
            element: (
              <PermissionGuard permissions={['reuniones.ver']}>
                <AgendaPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'credenciales',
            element: (
              <PermissionGuard permissions={['credenciales.ver', 'credenciales.generar']} requireAll={true}>
                <CredencialesPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'credenciales/historial',
            element: (
              <PermissionGuard permissions={['credenciales.ver']}>
                <CredencialesHistorialPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'validar-qr',
            element: (
              <PermissionGuard permissions={['participantes.gestionar_checkin']}>
                <ValidarQRPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'kpis',
            element: (
              <PermissionGuard permissions={['kpis.ver']}>
                <KPIsPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'seguimiento',
            element: (
              <PermissionGuard>
                <SeguimientoPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'roles',
            element: (
              <PermissionGuard>
                <RolesPage />
              </PermissionGuard>
            ),
          },
          {
            path: 'organizadores',
            element: (
              <PermissionGuard>
                <OrganizadoresPage />
              </PermissionGuard>
            ),
          },
        ],
      },
    ],
  },
]);
