'use client';

import { useState, useEffect } from 'react';
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
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

/**
 * Dashboard tributario con indicadores y gráficos
 */
export default function TributarioDashboardPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalDebt: 0,
    activeTaxpayers: 0,
    solvenciesIssued: 0,
    defaultRate: 0,
  });

  const [collectionData, setCollectionData] = useState([]);
  const [taxTypeData, setTaxTypeData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simular datos mientras se implementan los endpoints reales
      setStats({
        totalRevenue: 15420000,
        monthlyRevenue: 2340000,
        totalDebt: 4560000,
        activeTaxpayers: 3245,
        solvenciesIssued: 156,
        defaultRate: 14.2,
      });

      setCollectionData([
        { month: 'Ene', amount: 1800000 },
        { month: 'Feb', amount: 2100000 },
        { month: 'Mar', amount: 1950000 },
        { month: 'Abr', amount: 2300000 },
        { month: 'May', amount: 2150000 },
        { month: 'Jun', amount: 2340000 },
      ]);

      setTaxTypeData([
        { name: 'Patentes', value: 35, amount: 8190000 },
        { name: 'Inmuebles', value: 30, amount: 7020000 },
        { name: 'Vehículos', value: 20, amount: 4680000 },
        { name: 'Tasas', value: 15, amount: 3510000 },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

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
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

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
              +12.5% vs mes anterior
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
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +8.2% vs mes anterior
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
                Evolución de la recaudación en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={collectionData}>
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taxTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taxTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                <div className="space-y-4">
                  {taxTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Recaudación</CardTitle>
              <CardDescription>
                Comparación con metas establecidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={collectionData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    name="Meta"
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    data={collectionData.map(d => ({ ...d, target: 2200000 }))}
                  />
                </LineChart>
              </ResponsiveContainer>
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
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Vencimiento de Patentes</p>
                  <p className="text-xs text-muted-foreground">
                    142 patentes vencen en los próximos 15 días
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Morosos Críticos</p>
                  <p className="text-xs text-muted-foreground">
                    38 contribuyentes con deudas mayores a 6 meses
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Solvencias Pendientes</p>
                  <p className="text-xs text-muted-foreground">
                    23 solicitudes de solvencia en revisión
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Contribuyentes</CardTitle>
            <CardDescription>
              Mayores contribuyentes del mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Empresa ABC, C.A.', amount: 450000 },
                { name: 'Comercial XYZ', amount: 380000 },
                { name: 'Industrias DEF', amount: 320000 },
                { name: 'Servicios GHI', amount: 290000 },
                { name: 'Grupo JKL', amount: 250000 },
              ].map((contributor, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{contributor.name}</span>
                  </div>
                  <span className="font-bold text-sm">{formatCurrency(contributor.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
