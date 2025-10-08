// components/Navbar.js
import Link from 'next/link';
import { SignedOut, SignedIn, UserButton, SignInButton } from '@clerk/nextjs'

export default function Navbar() {
  return (
    <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/globe.svg" alt="Logo ConfiaTrade" className="w-10 h-10 mr-2" />
        <span className="text-2xl font-bold">ConfiaTrade</span>
      </div>

      {/* Links de navegación */}
      <div className="hidden md:flex gap-6 text-lg">
        <Link href="/" className="hover:text-yellow-300">
          Inicio
        </Link>
        <Link href="/productos" className="hover:text-yellow-300">
          Productos
        </Link>      
        <Link href="/como-funciona" className="hover:text-yellow-300">
          Cómo Funciona
        </Link>
        <Link href="/sobre-nosotros" className="hover:text-yellow-300">
          Sobre Nosotros
        </Link>
      </div>

      {/* Login / Usuario */}
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition">
              Iniciar Sesión
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
