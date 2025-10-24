'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/components/providers/AuthProvider';

/**
 * Providers de la aplicación
 * Envuelve la app con los providers necesarios
 */
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
