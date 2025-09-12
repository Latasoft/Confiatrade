// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      {/* Logo o nombre del sitio */}
      <div className="text-xl font-bold text-red-700">ConfiaTrade</div>

      {/* Enlaces a páginas */}
      <div className="space-x-6 font-medium">
        <Link href="/">Inicio</Link>
        <Link href="/productos">Productos</Link>
        <Link href="/transportes">Transportes</Link>
        <Link href="/pedidos">Pedidos</Link>
        <Link href="/como-funciona">Cómo Funciona</Link>
        <Link href="/sobre-nosotros">Sobre Nosotros</Link>
      </div>
    </nav>
  );
}
