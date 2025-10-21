'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportTracker from '@/components/modules/participation/ReportTracker';

/**
 * Contenido de la página de seguimiento
 */
function TrackingContent() {
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Botón de regreso */}
        <Link href="/reportes">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a reportes
          </Button>
        </Link>

        {/* Componente de seguimiento */}
        <ReportTracker initialTicket={ticket} />
      </div>
    </div>
  );
}

/**
 * Página de seguimiento de reportes
 */
export default function SeguimientoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Seguimiento de Reporte</h1>
            <p className="text-xl text-blue-100">
              Consulta el estado de tu reporte ciudadano
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-gray-500">Cargando...</p>
            </div>
          </div>
        }
      >
        <TrackingContent />
      </Suspense>
    </div>
  );
}
