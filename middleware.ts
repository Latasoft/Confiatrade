import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const isPublicRoute = createRouteMatcher([
  '/',
  '/sobre-nosotros',
  '/como-funciona',
  '/productos',
  '/transportes',
  '/pedidos',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/test-connection',
  '/diagnostic',
  '/admin-test',
  '/role-management',
  '/test-roles',
  '/direct-test'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isClientRoute = createRouteMatcher(['/cliente(.*)'])

export default clerkMiddleware(async (auth, req) => {
  console.log(`🌐 Accediendo a: ${req.nextUrl.pathname}`);
  
  // Permitir acceso a todas las rutas públicas sin restricción
  if (isPublicRoute(req)) {
    console.log(`✅ Ruta pública permitida: ${req.nextUrl.pathname}`);
    return NextResponse.next()
  }

  try {
    const { userId } = await auth()
    console.log(`👤 Usuario ID: ${userId}`);
    
    // Si no está autenticado y trata de acceder a ruta protegida
    if (!userId) {
      console.log(`❌ Sin autenticación, redirigiendo a sign-in`);
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Obtener el rol desde Supabase usando el clerk_id
    let userRole = 'cliente'
    
    try {
      const { data: userData, error } = await supabase
        .from('usuarios_roles')
        .select('rol, activo')
        .eq('clerk_id', userId)
        .single()

      if (!error && userData) {
        userRole = userData.rol || 'cliente'
        console.log(`🎭 Rol del usuario desde Supabase: ${userRole}`)
        console.log(`📊 Datos de usuario:`, userData)
        
        // REDIRECCIÓN AUTOMÁTICA PARA ADMIN
        if (userRole === 'admin' && req.nextUrl.pathname === '/') {
          console.log(`🚀 ADMIN detectado en /, redirigiendo a /admin`)
          return NextResponse.redirect(new URL('/admin', req.url))
        }
      } else {
        console.log(`⚠️ Usuario no encontrado en Supabase, usando rol por defecto: cliente`)
      }
    } catch (supabaseError) {
      console.error('❌ Error consultando Supabase:', supabaseError)
      // En caso de error, continuar con rol cliente
    }
    
    // Redireccionamiento automático después del login (solo desde rutas específicas)
    if (req.nextUrl.pathname === '/' || 
        req.nextUrl.pathname === '/sign-in' || 
        req.nextUrl.pathname === '/sign-up') {
      if (userRole === 'admin') {
        console.log(`🚀 Redirigiendo admin a /admin`);
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      // Los clientes permanecen en la página principal
    }

    // Proteger rutas de admin solo para admins
    if (isAdminRoute(req) && userRole !== 'admin') {
      console.log(`🚫 Acceso denegado a admin, redirigiendo a página principal`);
      return NextResponse.redirect(new URL('/', req.url))
    }

    console.log(`✅ Acceso permitido a: ${req.nextUrl.pathname}`);
    return NextResponse.next()
  } catch (error) {
    console.error('❌ Error en middleware:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}
