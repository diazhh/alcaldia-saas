'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  getTripStatistics,
  getFuelStatistics,
  getMaintenanceStatistics,
} from '@/services/fleet.service';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Fleet Charts Component - Displays various charts for fleet analytics
 */
export default function FleetCharts() {
  // Fetch statistics for charts
  const { data: tripStats } = useQuery({
    queryKey: ['tripStatistics', 'chart'],
    queryFn: () => getTripStatistics({ period: 'year', groupBy: 'month' }),
  });

  const { data: fuelStats } = useQuery({
    queryKey: ['fuelStatistics', 'chart'],
    queryFn: () => getFuelStatistics({ period: 'year', groupBy: 'month' }),
  });

  const { data: maintenanceStats } = useQuery({
    queryKey: ['maintenanceStatistics', 'chart'],
    queryFn: () => getMaintenanceStatistics({ period: 'year', groupBy: 'type' }),
  });

  // Prepare data for monthly trips chart
  const tripsChartData = tripStats?.byMonth || [];

  // Prepare data for fuel consumption chart
  const fuelChartData = fuelStats?.byMonth || [];

  // Prepare data for maintenance types pie chart
  const maintenanceTypeData = maintenanceStats?.byType || [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Monthly Trips Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Viajes Mensuales</CardTitle>
          <CardDescription>Cantidad de viajes y kilómetros recorridos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tripsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="trips"
                stroke="#3b82f6"
                name="Viajes"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="distance"
                stroke="#10b981"
                name="Kilómetros"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fuel Consumption Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo de Combustible</CardTitle>
          <CardDescription>Litros consumidos por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="liters" fill="#f59e0b" name="Litros" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Maintenance Types Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Mantenimiento</CardTitle>
          <CardDescription>Distribución por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={maintenanceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {maintenanceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fuel Cost Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Costos Operativos Mensuales</CardTitle>
          <CardDescription>Combustible y mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="fuelCost" fill="#3b82f6" name="Combustible (Bs.)" />
              <Bar
                dataKey="maintenanceCost"
                fill="#8b5cf6"
                name="Mantenimiento (Bs.)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
