import NavbarAdmin from '@/components/ui/NavbarAdmin'
import Footer from '@/components/ui/Footer'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'
import { AdminProtectedRoute } from '@/components/ProtectedRoutes'

export default function AdminLayout({ children }) {
  return (
    <AdminProtectedRoute>
      <BackgroundWrapper>
        <div className="flex flex-col min-h-screen">
          <NavbarAdmin />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </BackgroundWrapper>
    </AdminProtectedRoute>
  )
}
