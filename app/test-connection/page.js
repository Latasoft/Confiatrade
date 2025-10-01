'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestConnectionPage() {
  const [testResults, setTestResults] = useState({
    supabase: { status: 'testing', message: 'Probando conexión...' },
    users: { status: 'testing', message: 'Probando tabla users...' },
    productos: { status: 'testing', message: 'Probando tabla productos...' },
    pagos: { status: 'testing', message: 'Probando tabla pagos...' },
    envios: { status: 'testing', message: 'Probando tabla envios...' },
  });

  useEffect(() => {
    async function testConnections() {
      // Test Supabase connection
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        
        setTestResults(prev => ({
          ...prev,
          supabase: { status: 'success', message: 'Conexión a Supabase exitosa' }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          supabase: { status: 'error', message: `Error: ${error.message}` }
        }));
      }

      // Test users table
      try {
        const { data, error } = await supabase.from('users').select('*').limit(5);
        if (error) throw error;
        
        setTestResults(prev => ({
          ...prev,
          users: { 
            status: 'success', 
            message: `Tabla users: ${data.length} registros encontrados`,
            data: data
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          users: { status: 'error', message: `Error tabla users: ${error.message}` }
        }));
      }

      // Test productos table
      try {
        const { data, error } = await supabase.from('productos').select('*').limit(5);
        if (error) throw error;
        
        setTestResults(prev => ({
          ...prev,
          productos: { 
            status: 'success', 
            message: `Tabla productos: ${data.length} registros encontrados`,
            data: data
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          productos: { status: 'error', message: `Error tabla productos: ${error.message}` }
        }));
      }

      // Test pagos table
      try {
        const { data, error } = await supabase.from('pagos').select('*').limit(5);
        if (error) throw error;
        
        setTestResults(prev => ({
          ...prev,
          pagos: { 
            status: 'success', 
            message: `Tabla pagos: ${data.length} registros encontrados`,
            data: data
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          pagos: { status: 'error', message: `Error tabla pagos: ${error.message}` }
        }));
      }

      // Test envios table
      try {
        const { data, error } = await supabase.from('envios').select('*').limit(5);
        if (error) throw error;
        
        setTestResults(prev => ({
          ...prev,
          envios: { 
            status: 'success', 
            message: `Tabla envios: ${data.length} registros encontrados`,
            data: data
          }
        }));
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          envios: { status: 'error', message: `Error tabla envios: ${error.message}` }
        }));
      }
    }

    testConnections();
  }, []);

  function getStatusIcon(status) {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '⚪';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'testing': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Prueba de Conexiones - ConfiaTrade</h1>
        
        <div className="space-y-4">
          {Object.entries(testResults).map(([key, result]) => (
            <div 
              key={key} 
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{getStatusIcon(result.status)}</span>
                  <div>
                    <h3 className="font-semibold capitalize">{key}</h3>
                    <p className="text-sm">{result.message}</p>
                  </div>
                </div>
              </div>
              
              {result.data && result.data.length > 0 && (
                <div className="mt-4 bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">Datos de muestra:</h4>
                  <pre className="text-xs overflow-x-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(result.data[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Enlaces de Prueba</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a 
              href="/admin-test" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
            >
              Panel Admin
            </a>
            <a 
              href="/admin/usuarios" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
            >
              Usuarios
            </a>
            <a 
              href="/admin/productos" 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center"
            >
              Productos
            </a>
            <a 
              href="/admin/pagos" 
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-center"
            >
              Pagos
            </a>
            <a 
              href="/admin/envios" 
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-center"
            >
              Envíos
            </a>
            <a 
              href="/admin/reportes" 
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-center"
            >
              Reportes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}