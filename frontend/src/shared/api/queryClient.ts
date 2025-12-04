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
        // Reintentar solo una vez para otros errores
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});
