'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [envVars, setEnvVars] = useState({
    supabaseUrl: '',
    supabaseKey: '',
    urlLength: 0,
    keyLength: 0
  });

  useEffect(() => {
    // Verificar las variables de entorno del lado del cliente
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setEnvVars({
      supabaseUrl: url || 'NO CONFIGURADA',
      supabaseKey: key ? `${key.substring(0, 20)}...` : 'NO CONFIGURADA',
      urlLength: url ? url.length : 0,
      keyLength: key ? key.length : 0
    });
  }, []);

  const testDirectFetch = async () => {
    try {
      const response = await fetch('/api/test-supabase');
      const result = await response.json();
      console.log('Test directo:', result);
    } catch (error) {
      console.error('Error en test directo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Diagnóstico de Configuración</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Variables de Entorno</h2>
          <div className="space-y-3">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-sm">
                {envVars.supabaseUrl}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Longitud: {envVars.urlLength} caracteres
              </div>
            </div>
            
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-sm">
                {envVars.supabaseKey}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Longitud: {envVars.keyLength} caracteres
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Validación de URL</h2>
          <div className="space-y-2">
            <div>
              <strong>URL válida:</strong> {envVars.supabaseUrl.includes('supabase.co') ? '✅ Sí' : '❌ No'}
            </div>
            <div>
              <strong>HTTPS:</strong> {envVars.supabaseUrl.startsWith('https://') ? '✅ Sí' : '❌ No'}
            </div>
            <div>
              <strong>Formato esperado:</strong> {envVars.supabaseUrl.match(/https:\/\/[a-z]+\.supabase\.co/) ? '✅ Correcto' : '❌ Incorrecto'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pruebas</h2>
          <button 
            onClick={testDirectFetch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Probar API Route
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800">Posibles soluciones:</h3>
          <ul className="mt-2 text-yellow-700 text-sm space-y-1">
            <li>1. Verificar que el proyecto de Supabase existe y está activo</li>
            <li>2. Revisar que el URL en .env.local sea correcto</li>
            <li>3. Comprobar la conectividad a internet</li>
            <li>4. Regenerar las claves de API en el dashboard de Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}