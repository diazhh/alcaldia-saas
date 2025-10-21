'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Fuel,
  Wrench,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getFleetStatistics,
  getTripStatistics,
  getFuelStatistics,
  getMaintenanceStatistics,
  getUpcomingMaintenances,
} from '@/services/fleet.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import FleetCharts from '@/components/modules/fleet/FleetCharts';

export default function FleetDashboardPage() {
  // Fetch all statistics
  const { data: fleetStats, isLoading: isLoadingFleet } = useQuery({
    queryKey: ['fleetStatistics'],
    queryFn: getFleetStatistics,
  });

  const { data: tripStats, isLoading: isLoadingTrips } = useQuery({
    queryKey: ['tripStatistics'],
    queryFn: () => getTripStatistics({ period: 'month' }),
  });

  const { data: fuelStats, isLoading: isLoadingFuel } = useQuery({
    queryKey: ['fuelStatistics'],
    queryFn: () => getFuelStatistics({ period: 'month' }),
  });

  const { data: maintenanceStats, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ['maintenanceStatistics'],
    queryFn: () => getMaintenanceStatistics({ period: 'month' }),
  });

  const { data: upcomingMaintenances } = useQuery({
    queryKey: ['upcomingMaintenances'],
    queryFn: () => getUpcomingMaintenances(30),
  });

  const isLoading =
    isLoadingFleet || isLoadingTrips || isLoadingFuel || isLoadingMaintenance;

  // Calculate operational percentage
  const operationalPercentage = fleetStats?.total
    ? (fleetStats.operational / fleetStats.total) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Flota</h1>
        <p className="text-muted-foreground">
          Indicadores clave y estado general de la flota municipal
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : fleetStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? '--' : fleetStats?.operational || 0} operativos
            </p>
            <Progress value={operationalPercentage} className="mt-2" />
          </CardContent>
        </Card>

        {/* Trips This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : tripStats?.totalTrips || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? '--' : tripStats?.totalDistance?.toLocaleString() || 0} km
              recorridos
            </p>
          </CardContent>
        </Card>

        {/* Fuel Consumption */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combustible</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : fuelStats?.totalLiters?.toLocaleString() || 0} L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading
                ? '--'
                : `Bs. ${fuelStats?.totalCost?.toLocaleString() || 0}`}
            </p>
          </CardContent>
        </Card>

        {/* Maintenances */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : maintenanceStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? '--' : maintenanceStats?.pending || 0} pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Vehicles by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Vehículos</CardTitle>
            <CardDescription>Distribución por estado operativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Operativos</span>
              </div>
              <span className="font-semibold">
                {isLoading ? '--' : fleetStats?.operational || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm">En Mantenimiento</span>
              </div>
              <span className="font-semibold">
                {isLoading ? '--' : fleetStats?.inMaintenance || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Fuera de Servicio</span>
              </div>
              <span className="font-semibold">
                {isLoading ? '--' : fleetStats?.outOfService || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                <span className="text-sm">Inactivos</span>
              </div>
              <span className="font-semibold">
                {isLoading ? '--' : fleetStats?.inactive || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Promedio</CardTitle>
            <CardDescription>Eficiencia de combustible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Km por Litro</span>
              <span className="text-2xl font-bold">
                {isLoading
                  ? '--'
                  : fuelStats?.averageEfficiency?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Cargado</span>
              <span className="font-semibold">
                {isLoading ? '--' : fuelStats?.totalLiters?.toLocaleString() || 0} L
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Costo Total</span>
              <span className="font-semibold">
                Bs. {isLoading ? '--' : fuelStats?.totalCost?.toLocaleString() || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Costos del Mes</CardTitle>
            <CardDescription>Resumen de gastos operativos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Combustible</span>
              <span className="font-semibold">
                Bs. {isLoading ? '--' : fuelStats?.totalCost?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mantenimiento</span>
              <span className="font-semibold">
                Bs.{' '}
                {isLoading
                  ? '--'
                  : maintenanceStats?.totalCost?.toLocaleString() || 0}
              </span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">
                Bs.{' '}
                {isLoading
                  ? '--'
                  : (
                      (fuelStats?.totalCost || 0) +
                      (maintenanceStats?.totalCost || 0)
                    ).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <FleetCharts />

      {/* Alerts & Upcoming Maintenances */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas Activas
            </CardTitle>
            <CardDescription>Vehículos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando alertas...</p>
            ) : (
              <div className="space-y-3">
                {fleetStats?.alerts && fleetStats.alerts.length > 0 ? (
                  fleetStats.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.vehicle}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>
                      <Badge variant="outline">{alert.type}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay alertas activas
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Maintenances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Próximos Mantenimientos
            </CardTitle>
            <CardDescription>Programados para los próximos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMaintenances && upcomingMaintenances.length > 0 ? (
              <div className="space-y-3">
                {upcomingMaintenances.slice(0, 5).map((maintenance) => (
                  <Link
                    key={maintenance.id}
                    href={`/flota/mantenimiento`}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {maintenance.vehicle?.plate} - {maintenance.vehicle?.brand}{' '}
                        {maintenance.vehicle?.model}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {maintenance.type} -{' '}
                        {maintenance.scheduledDate
                          ? format(
                              new Date(maintenance.scheduledDate),
                              "d 'de' MMM",
                              { locale: es }
                            )
                          : 'Sin fecha'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        maintenance.status === 'PENDING'
                          ? 'default'
                          : maintenance.status === 'OVERDUE'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {maintenance.status === 'PENDING'
                        ? 'Pendiente'
                        : maintenance.status === 'OVERDUE'
                        ? 'Vencido'
                        : maintenance.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay mantenimientos programados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
