'use client'
// components/ui/NavbarAdmin.js
// 📌 Navbar para el rol Admin en ConfiaTrade con indicador activo.

import Link from 'next/link'
import { SignedOut, SignedIn, UserButton, SignInButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

export default function NavbarAdmin() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Panel' }, // experiencias creadas
    { href: '/admin/reservas', label: 'Reservas' }, // 👉 nuevo
    { href: '/admin/usuarios', label: 'Usuarios' },
    { href: '/admin/reportes', label: 'Reportes' },
    { href: '/admin/perfil', label: 'Mi Perfil' }, // 👉 en vez de seguridad
  ]

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/globe.svg" alt="Logo ConfiaTrade" className="w-10 h-10 mr-2" />
        <span className="text-2xl font-bold">ConfiaTrade</span>
      </div>

      {/* Links de navegación */}
      <div className="hidden md:flex gap-6 text-lg">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                isActive
                  ? 'text-yellow-300 font-bold border-b-2 border-yellow-300 pb-1'
                  : 'hover:text-yellow-300'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Login / Usuario */}
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition">
              Iniciar Sesión
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  )
}
