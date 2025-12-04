import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar en caso de errores 401 (sesión expirada)
        if (error instanceof AxiosError && error.response?.status === 401) {
          return false;
        }
        // No reintentar errores 500 (problemas del servidor como pool agotado)
        if (error instanceof AxiosError && error.response?.status === 500) {
          return false;
        }
        // Reintentar solo una vez para otros errores (404, 422, etc)
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // Datos frescos por 5 minutos
      gcTime: 10 * 60 * 1000, // Cache por 10 minutos
    },
  },
});
