'use client'

export default function ComoFunciona() {
  return (
    <main className="flex flex-col min-h-screen">
      <header className="bg-green-500 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/globe.svg" alt="Logo ConfiaTrade" className="w-10 h-10" />
          <h1 className="text-3xl font-semibold ml-2">ConfiaTrade</h1>
        </div>
      </header>

      <section className="p-6">
        <h2 className="text-3xl font-bold text-center mb-4">Cómo Funciona</h2>
        <p className="text-lg text-center">
          ConfiaTrade es una plataforma que conecta viajeros con experiencias auténticas y locales. Aquí, puedes explorar experiencias turísticas únicas y compartir tus propias aventuras.
        </p>
      </section>

      <footer className="bg-green-500 text-white py-4 px-6 mt-auto">
        <div className="text-center text-xs mt-4">
          © 2025 ConfiaTrade. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  )
}
