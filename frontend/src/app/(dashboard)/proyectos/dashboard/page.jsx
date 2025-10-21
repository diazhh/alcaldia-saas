'use client';

import { useRouter } from 'next/navigation';
import { useProjectStats } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const statusColors = {
  PLANNING: '#6b7280',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#10b981',
  PAUSED: '#f97316',
  CANCELLED: '#ef4444',
};

export default function ProjectsDashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading, error } = useProjectStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper para buscar de forma segura en arrays
  const findInArray = (array, predicate) => {
    return Array.isArray(array) ? array.find(predicate) : undefined;
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar estadísticas: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Preparar datos para gráficos con validaciones
  const statusData = Array.isArray(stats?.byStatus) 
    ? stats.byStatus.map(item => ({
        name: item.status,
        value: item.count,
        label: item.status === 'PLANNING' ? 'Planificación' :
               item.status === 'IN_PROGRESS' ? 'En Progreso' :
               item.status === 'COMPLETED' ? 'Completado' :
               item.status === 'PAUSED' ? 'Pausado' : 'Cancelado',
      }))
    : [];

  const sectorData = Array.isArray(stats?.bySector)
    ? stats.bySector.map(item => ({
        name: item.sector,
        proyectos: item.count,
        inversion: parseFloat(item.totalBudget || 0),
      }))
    : [];

  const priorityData = Array.isArray(stats?.byPriority)
    ? stats.byPriority.map(item => ({
        name: item.priority === 'LOW' ? 'Baja' :
              item.priority === 'MEDIUM' ? 'Media' :
              item.priority === 'HIGH' ? 'Alta' : 'Crítica',
        value: item.count,
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/proyectos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Proyectos</h1>
            <p className="text-gray-600 mt-1">
              Estadísticas y análisis de proyectos municipales
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Total de Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Todos los proyectos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              En Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {findInArray(stats?.byStatus, s => s.status === 'IN_PROGRESS')?.count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Proyectos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {findInArray(stats?.byStatus, s => s.status === 'COMPLETED')?.count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Proyectos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              Inversión Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.totalBudget || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Presupuesto total</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, value }) => `${label}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={statusColors[entry.name] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Proyectos por Prioridad */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Proyectos por Sector */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos e Inversión por Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'inversion') {
                    return formatCurrency(value);
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="proyectos" fill="#3b82f6" name="Proyectos" />
              <Bar yAxisId="right" dataKey="inversion" fill="#10b981" name="Inversión (Bs.)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Proyectos por Presupuesto */}
      {Array.isArray(stats?.topByBudget) && stats.topByBudget.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proyectos con Mayor Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topByBudget.map((project, index) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {formatCurrency(project.budget)}
                    </p>
                    <p className="text-xs text-gray-500">{project.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
