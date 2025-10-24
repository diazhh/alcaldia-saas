'use client';

import { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaxBillTable from '@/components/modules/tax/TaxBillTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de gestión de declaraciones tributarias
 */
export default function DeclaracionesPage() {
  const [selectedBill, setSelectedBill] = useState(null);

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    // TODO: Open bill detail dialog or navigate to detail page
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Declaraciones Tributarias</h1>
          <p className="text-muted-foreground mt-2">
            Gestión y consulta de declaraciones y facturas tributarias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Declaraciones</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vencidas</CardDescription>
            <CardTitle className="text-2xl text-red-600">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pagadas</CardDescription>
            <CardTitle className="text-2xl text-green-600">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bills Table */}
      <TaxBillTable onView={handleViewBill} />

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información sobre Declaraciones
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• Las declaraciones tributarias se generan automáticamente al crear facturas de impuestos</li>
            <li>• Puede filtrar por tipo de impuesto, estado y período fiscal</li>
            <li>• Las declaraciones vencidas generan intereses moratorios automáticamente</li>
            <li>• Puede exportar reportes en PDF y Excel para auditoría</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
