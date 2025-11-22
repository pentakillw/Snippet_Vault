import { QueryClient } from '@tanstack/react-query';

// Configuración centralizada para la caché y revalidación de datos
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Los datos se consideran frescos por 5 minutos
      refetchOnWindowFocus: false, // No recargar al cambiar de pestaña (mejor UX)
      retry: 1, // Reintentar solo 1 vez si falla la petición
    },
  },
});