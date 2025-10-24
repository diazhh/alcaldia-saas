'use client';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTaxDashboard } from '@/hooks/useTaxStatistics';

/**
 * Dashboard tributario con indicadores y gráficos conectados a datos reales
 */
export default function TributarioDashboardPage() {
  const { data, loading, error } = useTaxDashboard();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Tributario</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Tributario</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Tributario</h1>
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  const { stats, monthlyCollection, taxTypeDistribution, topContributors, alerts } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Tributario</h1>
        <p className="text-muted-foreground mt-2">
          Indicadores clave de recaudación y gestión tributaria
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recaudación del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              Recaudación actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contribuyentes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTaxpayers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
              En el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Morosidad Total
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalDebt)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
              {stats.defaultRate}% de morosidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solvencias Emitidas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.solvenciesIssued}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="collection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="collection">Recaudación Mensual</TabsTrigger>
          <TabsTrigger value="distribution">Distribución por Tipo</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recaudación Mensual</CardTitle>
              <CardDescription>
                Evolución de la recaudación en los últimos meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyCollection && monthlyCollection.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyCollection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="Recaudación" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No hay datos de recaudación disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Impuesto</CardTitle>
                <CardDescription>
                  Porcentaje de recaudación por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taxTypeDistribution && taxTypeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taxTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taxTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No hay datos de distribución disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recaudación por Categoría</CardTitle>
                <CardDescription>
                  Montos totales recaudados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taxTypeDistribution && taxTypeDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {taxTypeDistribution.map((item, index) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.amount)}</p>
                          <p className="text-xs text-muted-foreground">{item.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No hay datos disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Recaudación</CardTitle>
              <CardDescription>
                Evolución de la recaudación en el tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyCollection && monthlyCollection.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyCollection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Recaudación Real"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No hay datos de tendencias disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertas y acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts && alerts.expiringLicenses > 0 && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Vencimiento de Patentes</p>
                    <p className="text-xs text-muted-foreground">
                      {alerts.expiringLicenses} patentes vencen en los próximos 15 días
                    </p>
                  </div>
                </div>
              )}
              {alerts && alerts.criticalDefaulters > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Morosos Críticos</p>
                    <p className="text-xs text-muted-foreground">
                      {alerts.criticalDefaulters} contribuyentes con deudas mayores a 6 meses
                    </p>
                  </div>
                </div>
              )}
              {(!alerts || (alerts.expiringLicenses === 0 && alerts.criticalDefaulters === 0)) && (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  <div className="text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm">No hay alertas críticas en este momento</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Contribuyentes del Mes</CardTitle>
            <CardDescription>
              Mayores contribuyentes del mes actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topContributors && topContributors.length > 0 ? (
              <div className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.taxpayerId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium text-sm block">{contributor.name}</span>
                        <span className="text-xs text-muted-foreground">{contributor.taxId}</span>
                      </div>
                    </div>
                    <span className="font-bold text-sm">{formatCurrency(contributor.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No hay contribuyentes registrados este mes
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
