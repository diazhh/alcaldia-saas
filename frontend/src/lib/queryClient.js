import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración de React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de cache: 5 minutos
      staleTime: 1000 * 60 * 5,
      // Tiempo antes de garbage collection: 10 minutos
      gcTime: 1000 * 60 * 10,
      // Reintentar 1 vez en caso de error
      retry: 1,
      // No refetch automático en window focus
      refetchOnWindowFocus: false,
      // Refetch en reconexión
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentar mutaciones fallidas 1 vez
      retry: 1,
    },
  },
});
