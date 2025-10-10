'use client'

import { useEffect, useState } from 'react'

export function BackgroundWrapper({ children, className = "" }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Fondo base con gradiente dinámico mejorado */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/30 dark:from-gray-950 dark:via-slate-950 dark:to-blue-950/50 transition-all duration-700" />
      
      {/* Efectos de mouse interactivo */}
      <div 
        className="fixed pointer-events-none transition-opacity duration-300"
        style={{
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
          width: 400,
          height: 400,
        }}
      >
        <div className="w-full h-full bg-gradient-radial from-blue-200/20 via-purple-200/10 to-transparent dark:from-blue-800/20 dark:via-purple-800/10 dark:to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Elementos decorativos animados */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Orbes flotantes grandes con mejores colores */}
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-300/15 dark:from-blue-800/25 dark:to-indigo-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-violet-200/15 to-purple-300/20 dark:from-violet-800/20 dark:to-purple-900/15 rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-slate-200/15 to-gray-300/10 dark:from-slate-700/20 dark:to-gray-800/15 rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '1s' }} />
        
        {/* Elementos geométricos */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/60 dark:bg-blue-400/40 rounded-full animate-bounce" 
             style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
        <div className="absolute bottom-32 right-20 w-3 h-3 bg-purple-400/50 dark:bg-purple-400/30 rounded-full animate-bounce" 
             style={{ animationDelay: '1.5s', animationDuration: '2.5s' }} />
        <div className="absolute top-1/2 left-20 w-1 h-1 bg-indigo-500/70 dark:bg-indigo-400/50 rounded-full animate-pulse" />
        
        {/* Mesh pattern sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(180deg,rgba(59,130,246,0.02)_1px,transparent_1px)]" />
        
        {/* Líneas decorativas con gradiente */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 dark:via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 dark:via-purple-500/20 to-transparent" />
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Overlay final para harmonizar colores */}
      <div className="fixed inset-0 bg-gradient-to-t from-white/[0.02] via-transparent to-white/[0.02] dark:from-black/[0.02] dark:to-black/[0.02] pointer-events-none" />
    </div>
  )
}
