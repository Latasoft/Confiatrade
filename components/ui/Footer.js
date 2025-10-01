export default function Footer() {
  return (
    <footer className="bg-green-600 text-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h3 className="font-semibold text-lg">ConfiaTrade</h3>
        <p className="text-sm">
          Plataforma colaborativa para impulsar el comercio transfronterizo en Sudamérica.
        </p>
        <div className="text-xs mt-4">
          © {new Date().getFullYear()} ConfiaTrade. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
