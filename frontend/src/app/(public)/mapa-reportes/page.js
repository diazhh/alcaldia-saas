'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportsHeatmap from '@/components/modules/participation/ReportsHeatmap';

/**
 * Página pública del mapa de calor de reportes
 */
export default function MapaReportesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/reportes">
              <Button variant="ghost" className="text-white hover:bg-blue-700 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a reportes
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-4">Mapa de Reportes</h1>
            <p className="text-xl text-blue-100">
              Visualiza las zonas con mayor concentración de reportes ciudadanos
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ReportsHeatmap />
        </div>
      </div>
    </div>
  );
}
