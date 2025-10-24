'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Provider de autenticación
 * Maneja la verificación de sesión y redirecciones
 */
export function AuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, token, hydrateAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Hidratar el estado de autenticación desde localStorage
    const initAuth = async () => {
      try {
        // Dar tiempo a zustand para hidratar desde localStorage
        await new Promise(resolve => setTimeout(resolve, 100));

        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          if (state?.token && state?.user) {
            // Estado ya está hidratado por zustand persist
            setIsInitialized(true);
            return;
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Manejar redirecciones basadas en autenticación
  useEffect(() => {
    if (!isInitialized) return;

    const publicPaths = ['/login', '/registro', '/recuperar-password'];
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

    // Si está autenticado y en una página pública, redirigir al dashboard
    if (isAuthenticated && token && isPublicPath) {
      router.replace('/');
      return;
    }

    // Si no está autenticado y no está en una página pública, redirigir al login
    if (!isAuthenticated && !isPublicPath && !pathname?.startsWith('/_next')) {
      router.replace('/login');
      return;
    }
  }, [isAuthenticated, token, pathname, router, isInitialized]);

  // Mostrar loader mientras inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
