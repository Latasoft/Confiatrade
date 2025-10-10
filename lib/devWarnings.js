// Suprimir warnings específicos en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Suprimir warnings de Clerk en desarrollo
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Filtrar warnings específicos de Clerk
    if (
      message.includes('Clerk: Clerk has been loaded with development keys') ||
      message.includes('Clerk: The prop "afterSignInUrl" is deprecated') ||
      message.includes('Multiple GoTrueClient instances detected')
    ) {
      return;
    }
    
    // Mostrar otros warnings normalmente
    originalWarn.apply(console, args);
  };

  // Suprimir errores 404 de JWT template en desarrollo
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    if (
      message.includes('No JWT template exists with name: supabase') ||
      message.includes('404 (Not Found)') && message.includes('tokens/supabase')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

export {};