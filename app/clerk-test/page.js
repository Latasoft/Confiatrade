'use client'

import { useUser, SignInButton, SignUpButton, SignOutButton } from '@clerk/nextjs'

export default function ClerkTestPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de Clerk</h1>
      
      {isSignedIn ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-200 rounded">
            <h2 className="text-lg font-semibold text-green-800">¡Usuario autenticado!</h2>
            <p className="text-green-700">Email: {user?.emailAddresses?.[0]?.emailAddress}</p>
            <p className="text-green-700">ID: {user?.id}</p>
            <p className="text-green-700">Nombre: {user?.firstName} {user?.lastName}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Metadata:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(user?.publicMetadata, null, 2)}
            </pre>
          </div>
          
          <SignOutButton>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Cerrar Sesión
            </button>
          </SignOutButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 border rounded">
            <p className="text-gray-700">No hay usuario autenticado</p>
          </div>
          
          <div className="space-x-4">
            <SignInButton mode="modal">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Iniciar Sesión
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Registrarse
              </button>
            </SignUpButton>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Variables de entorno:</h3>
        <p className="text-sm text-blue-700">
          CLERK_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...
        </p>
      </div>
    </div>
  )
}