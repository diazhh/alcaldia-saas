'use client';

import { useRouter } from 'next/navigation';
import { useDepartmentTree } from '@/hooks/useDepartments';
import OrgChart from '@/components/modules/departments/OrgChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Página del organigrama visual
 */
export default function OrgChartPage() {
  const router = useRouter();
  const { data: departments, isLoading, error } = useDepartmentTree();

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organigrama Visual</h1>
            <p className="text-muted-foreground">
              Visualización gráfica de la estructura organizacional
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar el organigrama: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Chart */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Estructura Jerárquica</CardTitle>
          <CardDescription>
            Haz clic en un departamento para ver sus detalles. Usa los controles para hacer zoom y navegar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : departments && departments.length > 0 ? (
            <OrgChart
              departments={departments}
              onNodeClick={(node) => router.push(`/organizacion/departamentos/${node.id}`)}
              className="h-[600px]"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>No hay departamentos para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
