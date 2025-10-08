'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'

export function ThemeDemo() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-600 bg-clip-text text-transparent">
          ConfiaTrade - Tema Dinámico
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Experimenta con el cambio de tema claro/oscuro
        </p>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      <Separator />

      {/* Cards showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Nuevo</Badge>
            <Badge variant="secondary">Premium</Badge>
          </div>
          <h3 className="text-xl font-semibold">Producto Destacado</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Descripción del producto con el nuevo diseño glassmorphism.
          </p>
          <Button className="w-full">Ver Detalles</Button>
        </Card>

        <Card className="glass p-6 space-y-4">
          <Badge variant="outline">En Stock</Badge>
          <h3 className="text-xl font-semibold">Servicio de Transporte</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Transporte seguro y confiable para tus productos.
          </p>
          <Button variant="outline" className="w-full">Solicitar</Button>
        </Card>

        <Card className="glass p-6 space-y-4">
          <Badge variant="destructive">Limitado</Badge>
          <h3 className="text-xl font-semibold">Oferta Especial</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Promoción por tiempo limitado con descuentos especiales.
          </p>
          <Button variant="secondary" className="w-full">Aprovechar</Button>
        </Card>
      </div>

      {/* Feature showcase */}
      <div className="glass p-8 rounded-2xl space-y-6">
        <h2 className="text-2xl font-bold text-center">Características del Nuevo Tema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              🌓 Tema Automático
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Cambia automáticamente entre modo claro y oscuro según tus preferencias del sistema.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              ✨ Efectos Glassmorphism
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Diseño moderno con efectos de cristal y transparencias elegantes.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              🎨 Animaciones Fluidas
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Transiciones suaves y animaciones que mejoran la experiencia del usuario.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              📱 Diseño Responsivo
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Perfecto en dispositivos móviles, tablets y escritorio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}