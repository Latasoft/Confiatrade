import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { EmpresasPage } from './features/empresas/pages/EmpresasPage';
import { HomePage } from './features/home/pages/HomePage';
import EventosPage from './features/eventos/pages/EventosPage';
import CuraduriaPage from './features/curaduria/pages/CuraduriaPage';
import MatchingPage from './features/curaduria/pages/MatchingPage';
import AgendaPage from './features/agenda/pages/AgendaPage';
import ParticipantesPage from './features/participantes/pages/ParticipantesPage';
import KPIsPage from './features/kpis/pages/KPIsPage';
import SeguimientoPage from './features/seguimiento/pages/SeguimientoPage';
import CredencialesPage from './features/credenciales/pages/CredencialesPage';
import CredencialesHistorialPage from './features/credenciales/pages/CredencialesHistorialPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegistroPage from './features/auth/pages/RegistroPage';
import EmpresaDashboardPage from './features/empresa/pages/EmpresaDashboardPage';
import { ProtectedRoute, PublicRoute } from './features/auth/components/ProtectedRoute';

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
            path: 'agenda',
            element: <AgendaPage />,
          },
        ],
      },
    ],
  },

  // Rutas protegidas para administradores
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
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
            element: <EmpresasPage />,
          },
          {
            path: 'eventos',
            element: <EventosPage />,
          },
          {
            path: 'participantes',
            element: <ParticipantesPage />,
          },
          {
            path: 'curaduria',
            element: <CuraduriaPage />,
          },
          {
            path: 'matching',
            element: <MatchingPage />,
          },
          {
            path: 'agenda',
            element: <AgendaPage />,
          },
          {
            path: 'credenciales',
            element: <CredencialesPage />,
          },
          {
            path: 'credenciales/historial',
            element: <CredencialesHistorialPage />,
          },
          {
            path: 'kpis',
            element: <KPIsPage />,
          },
          {
            path: 'seguimiento',
            element: <SeguimientoPage />,
          },
        ],
      },
    ],
  },
]);
