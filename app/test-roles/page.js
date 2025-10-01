'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRolesPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();

  const testRedirection = (role) => {
    // Simular la lógica de redirección
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'cliente') {
      router.push('/cliente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Prueba de Redirección por Roles
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un rol para probar la redirección:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un rol --</option>
              <option value="admin">Admin</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <button
            onClick={() => testRedirection(selectedRole)}
            disabled={!selectedRole}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              selectedRole
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Probar Redirección
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-900 mb-2">¿Qué debería pasar?</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Admin:</strong> Te redirige a /admin (panel de administración)</li>
            <li>• <strong>Cliente:</strong> Te redirige a /cliente (panel de cliente)</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}