import Link from 'next/link'
import { SignedOut, SignedIn, UserButton, SignInButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'

export default function NavbarCliente() {
  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-white/10 dark:border-white/5">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/globe.svg" alt="Logo ConfiaTrade" className="w-10 h-10 mr-2 filter brightness-0 invert dark:brightness-100 dark:invert-0" />
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          ConfiaTrade
        </span>
      </div>

      {/* Links de navegación */}
      <div className="hidden md:flex gap-6 text-lg">
        <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          Inicio
        </Link>
        <Link href="/productos" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          Productos
        </Link>
        <Link href="/mis-productos" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          Mis Productos
        </Link>
        <Link href="/como-funciona" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          Cómo Funciona
        </Link>
        <Link href="/sobre-nosotros" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
          Sobre Nosotros
        </Link>
      </div>

      {/* Login / Usuario y Theme Toggle */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <SignedOut>
          <SignInButton>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
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
