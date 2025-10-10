'use client'
import Link from 'next/link'
import { UserButton } from "@clerk/nextjs"
import { useState } from 'react'

export default function NavbarCliente() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/cliente" className="text-2xl font-bold">
            ConfiaTrade
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/cliente" className="hover:text-green-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/productos" className="hover:text-green-200 transition-colors">
              Productos
            </Link>
            <Link href="/cliente/mis-solicitudes" className="hover:text-green-200 transition-colors">
              Mis Solicitudes
            </Link>
            <Link href="/transportes" className="hover:text-green-200 transition-colors">
              Transportes
            </Link>
            <Link href="/pedidos" className="hover:text-green-200 transition-colors">
              Pedidos
            </Link>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>

          {/* Botón hamburguesa para móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Menu móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-600">
            <div className="flex flex-col space-y-2">
              <Link href="/cliente" className="py-2 hover:text-green-200 transition-colors">
                Dashboard
              </Link>
              <Link href="/productos" className="py-2 hover:text-green-200 transition-colors">
                Productos
              </Link>
              <Link href="/cliente/mis-solicitudes" className="py-2 hover:text-green-200 transition-colors">
                Mis Solicitudes
              </Link>
              <Link href="/transportes" className="py-2 hover:text-green-200 transition-colors">
                Transportes
              </Link>
              <Link href="/pedidos" className="py-2 hover:text-green-200 transition-colors">
                Pedidos
              </Link>
              <div className="py-2">
                <UserButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
