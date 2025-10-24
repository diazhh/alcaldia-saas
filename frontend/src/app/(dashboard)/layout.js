'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else {
      setIsChecking(false);
    }
  }, []); // Solo ejecutar una vez al montar

  // Mostrar loader mientras verifica autenticación
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Navbar */}
        <Navbar user={user} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
