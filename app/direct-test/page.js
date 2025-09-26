'use client';

import { useRouter } from 'next/navigation';

export default function DirectTestPage() {
  const router = useRouter();

  const testDirectRedirect = (path) => {
    console.log(`Intentando ir a: ${path}`);
    window.location.href = path; // Redirección directa sin middleware
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Prueba Directa de Rutas
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => testDirectRedirect('/admin')}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            Ir Directamente a /admin
          </button>

          <button
            onClick={() => testDirectRedirect('/cliente')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Ir Directamente a /cliente
          </button>

          <button
            onClick={() => router.push('/admin')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            Ir con Router a /admin
          </button>

          <button
            onClick={() => router.push('/cliente')}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
          >
            Ir con Router a /cliente
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-900 mb-2">Diferencia:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Directo:</strong> Evita el middleware</li>
            <li>• <strong>Router:</strong> Pasa por el middleware</li>
          </ul>
        </div>
      </div>
    </div>
  );
}