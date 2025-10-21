'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportDetail from '@/components/modules/participation/ReportDetail';
import { getReport } from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Página de detalle de reporte
 */
export default function ReportDetailPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar reporte
   */
  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await getReport(params.id);
      setReport(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el reporte',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadReport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Cargando reporte...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 mb-4">No se encontró el reporte</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalle del Reporte</h1>
          <p className="text-gray-600 mt-1">
            Gestión y seguimiento del reporte ciudadano
          </p>
        </div>
      </div>

      {/* Detalle del reporte */}
      <ReportDetail report={report} onUpdate={loadReport} />
    </div>
  );
}
