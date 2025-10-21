'use client';

import { useRouter } from 'next/navigation';
import { useDepartmentReports } from '@/hooks/useDepartments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  AlertCircle,
  TrendingUp,
  BarChart3,
  UserX,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

/**
 * Dashboard principal del módulo de estructura organizacional
 */
export default function OrganizationDashboard() {
  const router = useRouter();
  const { data: reports, isLoading, error } = useDepartmentReports();

  // Colores para los gráficos
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280'];

  // Preparar datos para gráficos
  const departmentsByType = reports?.byType ? Object.entries(reports.byType).map(([type, count]) => ({
    name: type,
    value: count,
  })) : [];

  const employeesByDepartment = reports?.topDepartmentsByEmployees?.slice(0, 10) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estructura Organizacional</h1>
          <p className="text-muted-foreground">
            Dashboard con estadísticas y métricas de la organización
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/organizacion/organigrama')}>
            <Eye className="h-4 w-4 mr-2" />
            Ver Organigrama
          </Button>
          <Button onClick={() => router.push('/organizacion/departamentos')}>
            <Building2 className="h-4 w-4 mr-2" />
            Gestionar Departamentos
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las estadísticas: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departamentos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports?.totalDepartments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {reports?.activeDepartments || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              Asignados a departamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Depto.</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.averageEmployeesPerDepartment?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Empleados por departamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveles Jerárquicos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports?.maxHierarchyLevel || 0}</div>
            <p className="text-xs text-muted-foreground">
              Profundidad máxima
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(reports?.departmentsWithoutHead?.length > 0 || reports?.employeesWithoutDepartment?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports?.departmentsWithoutHead?.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">
                  {reports.departmentsWithoutHead.length} departamento(s) sin jefe
                </div>
                <div className="space-y-1">
                  {reports.departmentsWithoutHead.slice(0, 3).map((dept) => (
                    <div key={dept.id} className="text-sm">
                      • {dept.name} ({dept.code})
                    </div>
                  ))}
                  {reports.departmentsWithoutHead.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{reports.departmentsWithoutHead.length - 3} más
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {reports?.employeesWithoutDepartment?.length > 0 && (
            <Alert>
              <UserX className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">
                  {reports.employeesWithoutDepartment.length} empleado(s) sin departamento
                </div>
                <div className="space-y-1">
                  {reports.employeesWithoutDepartment.slice(0, 3).map((emp) => (
                    <div key={emp.id} className="text-sm">
                      • {emp.firstName} {emp.lastName}
                    </div>
                  ))}
                  {reports.employeesWithoutDepartment.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{reports.employeesWithoutDepartment.length - 3} más
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
            <CardDescription>
              Cantidad de departamentos por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top departamentos por empleados */}
        <Card>
          <CardHeader>
            <CardTitle>Departamentos con Más Personal</CardTitle>
            <CardDescription>
              Top 10 departamentos por número de empleados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employeesByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeesByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="employeeCount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listado de departamentos principales */}
      <Card>
        <CardHeader>
          <CardTitle>Direcciones Principales</CardTitle>
          <CardDescription>
            Departamentos de nivel superior en la jerarquía
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports?.rootDepartments && reports.rootDepartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.rootDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push(`/organizacion/departamentos/${dept.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{dept.code}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{dept.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{dept._count?.users || 0} empleados</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{dept._count?.children || 0} subdeptos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay departamentos principales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => router.push('/organizacion/departamentos')}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-sm">Gestionar Departamentos</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => router.push('/organizacion/organigrama')}
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm">Ver Organigrama</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => alert('Funcionalidad de reportes próximamente')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Generar Reportes</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => alert('Funcionalidad de análisis próximamente')}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Análisis Avanzado</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
