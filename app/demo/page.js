import { ThemeDemo } from '@/components/ThemeDemo'
import Navbar from '@/components/Navbar'

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ThemeDemo />
    </div>
  )
}