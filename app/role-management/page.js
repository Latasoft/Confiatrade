'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function RoleManagementPage() {
  const { user } = useUser();
  const [currentRole, setCurrentRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setCurrentRole(user.publicMetadata?.role || 'cliente');
    }
  }, [user]);

  const updateRole = async (newRole) => {
    setLoading(true);
    setMessage('');

    try {
      // Actualizar el rol en Clerk
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          role: newRole
        }
      });

      setCurrentRole(newRole);
      setMessage(`✅ Rol actualizado a: ${newRole}`);
      
      // Redirigir después de un momento
      setTimeout(() => {
        if (newRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/cliente';
        }
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar rol:', error);
      setMessage('❌ Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Debes estar autenticado para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Gestión de Roles</h1>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Usuario: {user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-600">Email: {user.emailAddresses[0]?.emailAddress}</p>
        </div>

        <div className="mb-6">
          <p className="font-semibold mb-2">Rol actual: <span className="text-blue-600">{currentRole}</span></p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 border border-blue-200">
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => updateRole('cliente')}
            disabled={loading || currentRole === 'cliente'}
            className={`w-full py-2 px-4 rounded font-medium ${
              currentRole === 'cliente'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading ? 'Actualizando...' : 'Establecer como Cliente'}
          </button>

          <button
            onClick={() => updateRole('admin')}
            disabled={loading || currentRole === 'admin'}
            className={`w-full py-2 px-4 rounded font-medium ${
              currentRole === 'admin'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {loading ? 'Actualizando...' : 'Establecer como Admin'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold mb-2">Información del Sistema:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Los admins son redirigidos a <code>/admin</code></li>
            <li>• Los clientes son redirigidos a <code>/cliente</code></li>
            <li>• El rol se guarda en Clerk metadata</li>
            <li>• Los cambios son inmediatos</li>
          </ul>
        </div>

        <div className="mt-4">
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}