import NavbarCliente from '@/components/ui/NavbarCliente'
import Footer from '@/components/ui/Footer'
import ProtectedRoute from '@/lib/ProtectedRoute'

export default function ClienteLayout({ children }) {
  return (
    <ProtectedRoute role="cliente">
      <div className="flex flex-col min-h-screen">
        <NavbarCliente />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
