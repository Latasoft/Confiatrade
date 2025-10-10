export default function Footer() {
  return (
    <footer className="glass mt-auto border-t border-white/10 dark:border-white/5 backdrop-blur-xl">
      <div className="container-responsive py-6 sm:py-8 text-center">
        <div className="mb-4">
          <h3 className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            ConfiaTrade
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Plataforma colaborativa para impulsar el comercio transfronterizo en Sudamérica.
          </p>
        </div>
        {/* Copyright */}
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-white/10 dark:border-white/5 pt-3 sm:pt-4">
          © {new Date().getFullYear()} ConfiaTrade. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
