'use client'

import { useState } from 'react'
import { X, User, Shield, Key } from 'lucide-react'

export function CredentialsModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botón flotante para mostrar credenciales */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center space-x-2"
          title="Ver credenciales de prueba"
        >
          <Key className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Credenciales</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/30 dark:border-gray-700/30">
            
            {/* Header */}
            <div className="p-6 border-b border-white/20 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  🔐 Credenciales de Prueba
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Admin Credentials */}
              <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Administrador</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                      admin@confiatrade.com
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Password:</span>
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                      admin123
                    </span>
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    → Redirige automáticamente a /admin
                  </div>
                </div>
              </div>

              {/* Client Credentials */}
              <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cliente</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                      cliente@confiatrade.com
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Password:</span>
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                      cliente123
                    </span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    → Redirige automáticamente a /cliente
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                🔒 Sistema de roles automático activado<br/>
                ⚡ Protección de rutas habilitada
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/20 dark:border-gray-700/30">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}