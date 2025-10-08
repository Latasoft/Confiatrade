export default function Footer() {
  return (
    <footer className="glass mt-auto border-t border-white/10 dark:border-white/5 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <div className="mb-4">
          <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            ConfiaTrade
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
            Plataforma colaborativa para impulsar el comercio transfronterizo en Sudamérica.
          </p>
        </div>
        
        {/* Enlaces rápidos */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <a href="/sobre-nosotros" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            Sobre Nosotros
          </a>
          <a href="/como-funciona" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            Cómo Funciona
          </a>
          <a href="/productos" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            Productos
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-white/10 dark:border-white/5 pt-4">
          © {new Date().getFullYear()} ConfiaTrade. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
