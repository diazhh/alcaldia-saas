/**
 * Dashboard de Proyección de Flujo de Caja
 * Visualiza proyecciones de ingresos y egresos con gráficos y análisis
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Calendar,
  RefreshCw,
  Plus,
  Download,
} from 'lucide-react';
import {
  useYearProjections,
  useProjectionStats,
  useDeficitAlerts,
  useGenerateYearProjections,
  useGenerateAutoProjection,
} from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const SCENARIO_CONFIG = {
  OPTIMISTIC: { label: 'Optimista', color: 'text-green-600', bgColor: 'bg-green-50' },
  REALISTIC: { label: 'Realista', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  PESSIMISTIC: { label: 'Pesimista', color: 'text-orange-600', bgColor: 'bg-orange-50' },
};

export function CashFlowProjectionDashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedScenario, setSelectedScenario] = useState('REALISTIC');

  const { data: projections, isLoading } = useYearProjections(selectedYear, selectedScenario);
  const { data: stats } = useProjectionStats(selectedYear);
  const { data: alerts } = useDeficitAlerts(selectedYear);
  const generateYearMutation = useGenerateYearProjections();
  const generateMonthMutation = useGenerateAutoProjection();

  const handleGenerateYear = async () => {
    await generateYearMutation.mutateAsync({ year: selectedYear, scenario: selectedScenario });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Preparar datos para gráficos
  const chartData = projections
    ?.filter((p) => p !== null)
    .map((proj, index) => ({
      month: MONTHS[proj.month - 1],
      monthNum: proj.month,
      projectedIncome: Number(proj.projectedIncome),
      projectedExpense: Number(proj.projectedExpense),
      projectedBalance: Number(proj.projectedBalance),
      actualIncome: proj.actualIncome ? Number(proj.actualIncome) : null,
      actualExpense: proj.actualExpense ? Number(proj.actualExpense) : null,
      actualBalance: proj.actualBalance ? Number(proj.actualBalance) : null,
      hasDeficit: proj.hasDeficit,
    })) || [];

  const hasProjections = chartData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyección de Flujo de Caja</h2>
          <p className="text-muted-foreground">
            Análisis y proyección de ingresos y egresos futuros
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPTIMISTIC">Optimista</SelectItem>
              <SelectItem value="REALISTIC">Realista</SelectItem>
              <SelectItem value="PESSIMISTIC">Pesimista</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateYear} disabled={generateYearMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${generateYearMutation.isPending ? 'animate-spin' : ''}`} />
            Generar Proyecciones
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos Proyectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalProjectedIncome)}</div>
              {stats.totalActualIncome > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Real: {formatCurrency(stats.totalActualIncome)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Egresos Proyectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalProjectedExpense)}</div>
              {stats.totalActualExpense > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Real: {formatCurrency(stats.totalActualExpense)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance Proyectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProjectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.totalProjectedBalance)}
              </div>
              {stats.totalActualBalance !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Real: {formatCurrency(stats.totalActualBalance)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meses con Déficit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.monthsWithDeficit} / {stats.totalMonths}
              </div>
              {stats.accuracy && (
                <p className="text-xs text-muted-foreground mt-1">
                  Precisión: {stats.accuracy}%
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Déficit */}
      {alerts && alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas de Déficit Proyectado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{MONTHS[alert.month - 1]} {alert.year}</p>
                    <p className="text-sm text-muted-foreground">{alert.notes || 'Déficit proyectado'}</p>
                  </div>
                  <Badge variant="destructive">
                    {formatCurrency(alert.deficitAmount)} déficit
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      {hasProjections ? (
        <Tabs defaultValue="balance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="income-expense">Ingresos vs Egresos</TabsTrigger>
            <TabsTrigger value="comparison">Proyectado vs Real</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance Proyectado Mensual</CardTitle>
                <CardDescription>
                  Diferencia entre ingresos y egresos proyectados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="projectedBalance"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Balance Proyectado"
                    />
                    {chartData.some((d) => d.actualBalance !== null) && (
                      <Area
                        type="monotone"
                        dataKey="actualBalance"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="Balance Real"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income-expense" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos y Egresos Proyectados</CardTitle>
                <CardDescription>
                  Comparación mensual de ingresos y egresos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Bar dataKey="projectedIncome" fill="#10b981" name="Ingresos Proyectados" />
                    <Bar dataKey="projectedExpense" fill="#ef4444" name="Egresos Proyectados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proyectado vs Real</CardTitle>
                <CardDescription>
                  Comparación entre valores proyectados y reales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="projectedIncome"
                      stroke="#3b82f6"
                      strokeDasharray="5 5"
                      name="Ingresos Proyectados"
                    />
                    <Line
                      type="monotone"
                      dataKey="actualIncome"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Ingresos Reales"
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedExpense"
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      name="Egresos Proyectados"
                    />
                    <Line
                      type="monotone"
                      dataKey="actualExpense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Egresos Reales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay proyecciones para {selectedYear}</h3>
            <p className="text-muted-foreground mb-4">
              Genera proyecciones automáticas basadas en datos históricos
            </p>
            <Button onClick={handleGenerateYear} disabled={generateYearMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Generar Proyecciones
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
