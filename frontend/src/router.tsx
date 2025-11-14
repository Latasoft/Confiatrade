import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { EmpresasPage } from './features/empresas/pages/EmpresasPage';
import { HomePage } from './features/home/pages/HomePage';

export const router = createBrowserRouter([
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
        path: 'participantes',
        element: <div className="p-8">Participantes</div>,
      },
      {
        path: 'curaduria',
        element: <div className="p-8">Curaduría</div>,
      },
      {
        path: 'agenda',
        element: <div className="p-8">Agenda B2B</div>,
      },
      {
        path: 'credenciales',
        element: <div className="p-8">Credenciales</div>,
      },
      {
        path: 'kpis',
        element: <div className="p-8">KPIs</div>,
      },
      {
        path: 'seguimiento',
        element: <div className="p-8">Seguimiento</div>,
      },
    ],
  },
]);
