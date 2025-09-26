'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/useProfile';
import { useAuth } from '@clerk/nextjs';

export default function RoleRedirect() {
  const { isSignedIn } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si el usuario está autenticado y no estamos cargando
    if (isSignedIn && !loading && profile) {
      const currentPath = window.location.pathname;
      
      // Redirigir desde la página de inicio o login
      if (currentPath === '/' || currentPath === '/sign-in' || currentPath === '/sign-up') {
        if (profile.rol === 'admin') {
          router.push('/admin');
        } else {
          router.push('/cliente');
        }
      }
      
      // Prevenir que admins accedan a rutas de cliente
      else if (currentPath.startsWith('/cliente') && profile.rol === 'admin') {
        router.push('/admin');
      }
      
      // Prevenir que clientes accedan a rutas de admin (excepto páginas de prueba)
      else if (currentPath.startsWith('/admin') && profile.rol !== 'admin' && 
               !currentPath.includes('/admin-test') && 
               !currentPath.includes('/test-connection')) {
        router.push('/cliente');
      }
    }
  }, [isSignedIn, profile, loading, router]);

  return null; // Este componente no renderiza nada
}