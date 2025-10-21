/**
 * Dashboard Principal de Finanzas
 * Muestra indicadores clave y resumen de la situación financiera
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  useBudgetByYear,
  useBudgetStats,
  useTransactionStats,
  useCashFlow,
  useBudgetExecutionAnalysis,
} from '@/hooks/useFinance';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function FinanzasPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: budget, isLoading: budgetLoading } = useBudgetByYear(selectedYear);
  const { data: budgetStats, isLoading: statsLoading } = useBudgetStats(budget?.id);
  const { data: transactionStats, isLoading: transStatsLoading } = useTransactionStats();
  const { data: executionAnalysis, isLoading: executionLoading } = useBudgetExecutionAnalysis(selectedYear);

  const isLoading = budgetLoading || statsLoading || transStatsLoading || executionLoading;

  // Datos para gráficos
  const budgetExecutionData = executionAnalysis?.items?.slice(0, 10).map(item => ({
    name: item.code,
    asignado: item.allocated,
    ejecutado: item.paid,
    disponible: item.available,
  })) || [];

  const executionByCategory = executionAnalysis?.items?.reduce((acc, item) => {
    const category = item.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += item.paid;
    return acc;
  }, {});

  const categoryData = Object.values(executionByCategory || {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
          <p className="text-muted-foreground">
            Dashboard financiero y control presupuestario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Indicadores Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(executionAnalysis?.totals?.allocated || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Año {selectedYear}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecutado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(executionAnalysis?.totals?.paid || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {executionAnalysis?.totals?.executionRate?.toFixed(1)}% del presupuesto
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(executionAnalysis?.totals?.available || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Disponible para comprometer
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprometido</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(executionAnalysis?.totals?.committed || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {executionAnalysis?.totals?.commitmentRate?.toFixed(1)}% comprometido
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Análisis */}
      <Tabs defaultValue="execution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="execution">Ejecución Presupuestaria</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ejecución Presupuestaria por Partida</CardTitle>
              <CardDescription>
                Top 10 partidas con mayor asignación presupuestaria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetExecutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="asignado" fill="#3b82f6" name="Asignado" />
                    <Bar dataKey="ejecutado" fill="#10b981" name="Ejecutado" />
                    <Bar dataKey="disponible" fill="#f59e0b" name="Disponible" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ejecución</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasa de Ejecución</span>
                      <span className="text-2xl font-bold text-green-600">
                        {executionAnalysis?.totals?.executionRate?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasa de Compromiso</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {executionAnalysis?.totals?.commitmentRate?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Asignado:</span>
                          <span className="font-medium">
                            {formatCurrency(executionAnalysis?.totals?.allocated || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Comprometido:</span>
                          <span className="font-medium">
                            {formatCurrency(executionAnalysis?.totals?.committed || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Causado:</span>
                          <span className="font-medium">
                            {formatCurrency(executionAnalysis?.totals?.accrued || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pagado:</span>
                          <span className="font-medium">
                            {formatCurrency(executionAnalysis?.totals?.paid || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas Presupuestarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executionAnalysis?.items
                    ?.filter(item => item.executionRate > 90)
                    ?.slice(0, 5)
                    ?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Ejecutado: {item.executionRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay alertas presupuestarias
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Gasto por Categoría</CardTitle>
              <CardDescription>
                Visualización del gasto ejecutado por categoría presupuestaria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Transacciones</CardTitle>
              <CardDescription>
                Resumen de las transacciones financieras del período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transStatsLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Compromisos
                    </p>
                    <p className="text-2xl font-bold">
                      {transactionStats?.byStatus?.COMPROMISO || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Causados
                    </p>
                    <p className="text-2xl font-bold">
                      {transactionStats?.byStatus?.CAUSADO || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pagados
                    </p>
                    <p className="text-2xl font-bold">
                      {transactionStats?.byStatus?.PAGADO || 0}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <a href="/finanzas/presupuesto">
                <FileText className="h-6 w-6 mb-2" />
                <span className="font-semibold">Presupuesto</span>
                <span className="text-xs text-muted-foreground">
                  Gestionar presupuesto anual
                </span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <a href="/finanzas/ejecucion">
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="font-semibold">Ejecución del Gasto</span>
                <span className="text-xs text-muted-foreground">
                  Comprometer, causar y pagar
                </span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <a href="/finanzas/tesoreria">
                <Wallet className="h-6 w-6 mb-2" />
                <span className="font-semibold">Tesorería</span>
                <span className="text-xs text-muted-foreground">
                  Cuentas bancarias y pagos
                </span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
              <a href="/finanzas/reportes">
                <FileText className="h-6 w-6 mb-2" />
                <span className="font-semibold">Reportes</span>
                <span className="text-xs text-muted-foreground">
                  Estados financieros y ONAPRE
                </span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
