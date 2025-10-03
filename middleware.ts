import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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
    const { userId, sessionClaims } = await auth()
    console.log(`👤 Usuario ID: ${userId}`);
    
    // Si no está autenticado y trata de acceder a ruta protegida
    if (!userId) {
      console.log(`❌ Sin autenticación, redirigiendo a sign-in`);
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Si está autenticado, obtener el rol del usuario
    if (userId && sessionClaims) {
      const userRole = (sessionClaims as any)?.metadata?.role || 
                      (sessionClaims as any)?.publicMetadata?.role || 
                      'cliente'
      
      console.log(`🎭 Rol del usuario: ${userRole}`);
      
      // Redireccionamiento automático después del login (solo desde rutas específicas)
      if (req.nextUrl.pathname === '/sign-in' || 
          req.nextUrl.pathname === '/sign-up') {
        if (userRole === 'admin') {
          console.log(`🚀 Redirigiendo admin a /admin`);
          return NextResponse.redirect(new URL('/admin', req.url))
        } else {
          console.log(`🚀 Redirigiendo cliente a /`);
          return NextResponse.redirect(new URL('/', req.url))
        }
      }

      // Proteger rutas de admin solo para admins
      if (isAdminRoute(req) && userRole !== 'admin') {
        console.log(`🚫 Acceso denegado a admin, redirigiendo a cliente`);
        return NextResponse.redirect(new URL('/', req.url))
      }

      // Proteger rutas de cliente - admin puede acceder
      if (isClientRoute(req) && userRole === 'admin') {
        console.log(`⚠️ Admin accediendo a ruta de cliente - permitido`);
        // Los admins pueden ver las rutas de cliente también
        return NextResponse.next()
      }
    }

    console.log(`✅ Acceso permitido a: ${req.nextUrl.pathname}`);
    return NextResponse.next()
  } catch (error) {
    console.error('❌ Error en middleware:', error)
    // En caso de error, redirigir a home en lugar de bloquear
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}
