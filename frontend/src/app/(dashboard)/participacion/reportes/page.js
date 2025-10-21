'use client';

import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReportsStats from '@/components/modules/participation/ReportsStats';
import ReportsTable from '@/components/modules/participation/ReportsTable';
import { listReports, getReportsStats } from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Página de gestión de reportes ciudadanos
 */
export default function ReportesPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar reportes y estadísticas
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsResponse, statsResponse] = await Promise.all([
        listReports({ limit: 100 }),
        getReportsStats(),
      ]);

      setReports(reportsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los reportes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mesa de Control</h1>
          <p className="text-gray-600 mt-1">
            Gestión de reportes ciudadanos
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <ReportsStats stats={stats} />

      {/* Tabla de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>
            Listado de todos los reportes ciudadanos recibidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable 
            reports={reports} 
            loading={loading}
            onRefresh={loadData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
