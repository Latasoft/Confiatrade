'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Upload, CreditCard, Building, User } from 'lucide-react'

export function TransferenciaComponent({ monto = "$150.000", onSubmit }) {
  const [comprobante, setComprobante] = useState(null)
  const [loading, setLoading] = useState(false)

  // Datos de transferencia de R.S. Kaddu Ingeniería y Servicios SpA
  const datosTransferencia = {
    banco: "Banco BCI",
    tipoCuenta: "Cuenta Corriente",
    numeroCuenta: "46734091",
    titular: "R.S. Kaddu Ingeniería y Servicios SpA",
    rut: "77.349.912-8",
    email: "invchincol@gmail.com",
    monto: monto
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea imagen o documento
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPG, PNG, WEBP) o documentos PDF')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 5MB')
        return
      }
      
      setComprobante(file)
      toast.success('Comprobante cargado correctamente')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!comprobante) {
      toast.error('Por favor, sube el comprobante de transferencia')
      return
    }

    setLoading(true)
    
    // Si se proporciona una función onSubmit personalizada, usarla
    if (onSubmit) {
      onSubmit(comprobante, setLoading)
    } else {
      // Comportamiento por defecto
      setTimeout(() => {
        setLoading(false)
        toast.success('Comprobante enviado correctamente')
        console.log('Archivo enviado:', comprobante.name)
      }, 2000)
    }
  }

  const removeFile = () => {
    setComprobante(null)
    toast.info('Comprobante removido')
  }

  return (
    <div className="space-y-8">
      {/* Carta grande con datos de transferencia */}
      <div className="glass rounded-2xl p-8 animate-fadeIn">
        <div className="text-center mb-6">
          <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Información de Transferencia
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Copia estos datos para realizar tu transferencia bancaria
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Building className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Banco</p>
                <p className="font-semibold text-gray-800 dark:text-white">{datosTransferencia.banco}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Cuenta</p>
                <p className="font-semibold text-gray-800 dark:text-white">{datosTransferencia.tipoCuenta}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-lg font-bold text-purple-500 flex-shrink-0">#</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Número de Cuenta</p>
                <p className="font-mono font-semibold text-gray-800 dark:text-white text-lg">{datosTransferencia.numeroCuenta}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <User className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Titular</p>
                <p className="font-semibold text-gray-800 dark:text-white">{datosTransferencia.titular}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-lg font-bold text-red-500 flex-shrink-0">RUT</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">RUT</p>
                <p className="font-mono font-semibold text-gray-800 dark:text-white">{datosTransferencia.rut}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-lg font-bold text-green-600 flex-shrink-0">$</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monto a Transferir</p>
                <p className="font-bold text-green-600 dark:text-green-400 text-xl">{datosTransferencia.monto}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            <strong>Importante:</strong> Una vez realizada la transferencia, sube el comprobante en el formulario de abajo para procesar tu pedido.
          </p>
        </div>
      </div>

      {/* Formulario para subir comprobante */}
      <div className="glass rounded-2xl p-8 animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <Upload className="h-6 w-6 mr-3 text-blue-500" />
          Subir Comprobante de Transferencia
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comprobante de Transferencia
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-300">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Subir archivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP, PDF hasta 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Vista previa del archivo */}
          {comprobante && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      {comprobante.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {(comprobante.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || !comprobante}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Enviar Comprobante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}