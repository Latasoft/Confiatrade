'use client'

import { useEffect, useState } from 'react'

export function BackgroundWrapper({ children, className = "" }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let rafId

    const updateMousePosition = (e) => {
      // Usar requestAnimationFrame para optimizar el rendimiento
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    // Throttle del evento mousemove para evitar demasiadas actualizaciones
    let throttleTimeout
    const throttledUpdate = (e) => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateMousePosition(e)
          throttleTimeout = null
        }, 16) // ~60fps
      }
    }

    window.addEventListener('mousemove', throttledUpdate, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', throttledUpdate)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
      }
    }
  }, [])

  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Fondo base blanco limpio */}
      <div className="fixed inset-0 bg-white dark:bg-gray-900 transition-all duration-700" />
      
      {/* Patrón sutil para textura */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Mesh pattern muy sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(180deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Overlay sutil */}
      <div className="fixed inset-0 bg-gradient-to-t from-gray-50/10 via-transparent to-gray-50/10 dark:from-gray-800/10 dark:to-gray-800/10 pointer-events-none" />
    </div>
  )
}
