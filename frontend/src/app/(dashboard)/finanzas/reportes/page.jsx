/**
 * Página de Reportes Financieros
 * Generación de estados financieros y reportes ONAPRE
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart3 } from 'lucide-react';
import {
  useBalanceSheet,
  useIncomeStatement,
  useBudgetExecutionAnalysis,
  useOnapreForm1013,
} from '@/hooks/useFinance';

export default function ReportesPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: balanceSheet } = useBalanceSheet(new Date());
  const { data: executionAnalysis } = useBudgetExecutionAnalysis(selectedYear);
  const { data: onapre1013 } = useOnapreForm1013(selectedYear);

  const reports = [
    {
      id: 'balance',
      title: 'Balance General',
      description: 'Estado de situación financiera del municipio',
      icon: FileText,
      category: 'Estados Financieros',
    },
    {
      id: 'income',
      title: 'Estado de Resultados',
      description: 'Ingresos y gastos del período',
      icon: BarChart3,
      category: 'Estados Financieros',
    },
    {
      id: 'cashflow',
      title: 'Flujo de Efectivo',
      description: 'Movimientos de efectivo del período',
      icon: BarChart3,
      category: 'Estados Financieros',
    },
    {
      id: 'execution',
      title: 'Ejecución Presupuestaria',
      description: 'Análisis de la ejecución del presupuesto',
      icon: BarChart3,
      category: 'Presupuestarios',
    },
    {
      id: 'onapre-1013',
      title: 'ONAPRE Form 1013',
      description: 'Ejecución financiera del presupuesto',
      icon: FileText,
      category: 'ONAPRE',
    },
    {
      id: 'onapre-2345',
      title: 'ONAPRE Form 2345',
      description: 'Balance general formato ONAPRE',
      icon: FileText,
      category: 'ONAPRE',
    },
  ];

  const categories = [...new Set(reports.map(r => r.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes Financieros</h1>
          <p className="text-muted-foreground">
            Generación de estados financieros y reportes oficiales
          </p>
        </div>
      </div>

      {/* Reportes por Categoría */}
      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports
                .filter(report => report.category === category)
                .map(report => {
                  const Icon = report.icon;
                  return (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Icon className="h-8 w-8 text-primary-600" />
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                        <CardTitle className="mt-4">{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button className="w-full" variant="outline">
                            Ver Reporte
                          </Button>
                          <Button className="w-full" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Excel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Resumen de Reportes Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Estados Financieros</h3>
              <p className="text-sm text-muted-foreground">
                Los estados financieros muestran la situación económica del municipio según
                principios contables generalmente aceptados.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Reportes ONAPRE</h3>
              <p className="text-sm text-muted-foreground">
                Formatos oficiales requeridos por la Oficina Nacional de Presupuesto (ONAPRE)
                para el control y seguimiento de la gestión presupuestaria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
