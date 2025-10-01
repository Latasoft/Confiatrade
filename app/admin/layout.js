import NavbarAdmin from '@/components/ui/NavbarAdmin'
import Footer from '@/components/ui/Footer'
//import ProtectedRoute from '@/lib/ProtectedRoute'

export default function AdminLayout({ children }) {
  return (
    //<ProtectedRoute role="admin">
      <div className="flex flex-col min-h-screen">
        <NavbarAdmin />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    //</ProtectedRoute>
  )
}
