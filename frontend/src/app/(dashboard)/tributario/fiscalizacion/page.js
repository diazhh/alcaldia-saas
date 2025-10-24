'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InspectionTable from '@/components/modules/tax/InspectionTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de gestión de fiscalización e inspecciones tributarias
 */
export default function FiscalizacionPage() {
  const [selectedInspection, setSelectedInspection] = useState(null);

  const handleViewInspection = (inspection) => {
    setSelectedInspection(inspection);
    // TODO: Open inspection detail dialog
  };

  const handleNewInspection = () => {
    // TODO: Open new inspection dialog
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fiscalización Tributaria</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de inspecciones y control fiscal de actividades económicas
          </p>
        </div>
        <Button onClick={handleNewInspection}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Inspección
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Programadas
            </CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              En Progreso
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Completadas
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Con Infracciones
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Inspections Table */}
      <InspectionTable onView={handleViewInspection} />

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Tipos de Inspección
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li><strong>Rutinaria:</strong> Inspecciones programadas periódicamente</li>
              <li><strong>Por Denuncia:</strong> Inspecciones por denuncias ciudadanas</li>
              <li><strong>Seguimiento:</strong> Verificación de correcciones previas</li>
              <li><strong>Especial:</strong> Inspecciones por casos específicos</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proceso de Fiscalización
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-800">
            <ul className="space-y-2 text-sm">
              <li>1. Programación de la inspección</li>
              <li>2. Notificación al contribuyente</li>
              <li>3. Ejecución de la inspección</li>
              <li>4. Registro de hallazgos y recomendaciones</li>
              <li>5. Aplicación de sanciones si corresponde</li>
              <li>6. Seguimiento de correcciones</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
