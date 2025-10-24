'use client';

import { useState, useEffect } from 'react';
import { Clock, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

/**
 * Página de gestión de asistencia
 */
export default function AsistenciaPage() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/hr/attendance/stats?${params.toString()}`);
      console.log('Attendance API Response:', response);
      
      // Handle both response.data and response.data.data structures
      const data = response.data.data || response.data;
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Formato de respuesta inválido');
      }
      
      setAttendanceData(data);
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'No se pudieron cargar los datos de asistencia';
      
      if (err.response) {
        // Error de respuesta del servidor
        errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
      } else if (err.request) {
        // No se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        // Error en la configuración de la petición
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchAttendanceData();
  };

  const getStatusBadge = (status) => {
    const variants = {
      PRESENT: { label: 'Presente', className: 'bg-green-500' },
      ABSENT: { label: 'Ausente', className: 'bg-red-500' },
      LATE: { label: 'Retardo', className: 'bg-yellow-500' },
      JUSTIFIED: { label: 'Justificado', className: 'bg-blue-500' },
    };
    const config = variants[status] || variants.PRESENT;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de marcaciones y registro de asistencia
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 mb-4">{error}</p>
            <Button onClick={fetchAttendanceData} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safely extract data with defaults
  const stats = attendanceData?.stats || {
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    justified: 0,
    attendanceRate: 0
  };
  const periodStats = attendanceData?.periodStats || null;
  const records = attendanceData?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de marcaciones y registro de asistencia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Clock className="w-4 h-4 mr-2" />
            Registrar Marcación
          </Button>
        </div>
      </div>

      {/* Estadísticas del día */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Empleados</CardDescription>
            <CardTitle className="text-3xl">{stats.totalEmployees}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presentes</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.present}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.attendanceRate}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ausentes</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.absent}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmployees > 0
                ? ((stats.absent / stats.totalEmployees) * 100).toFixed(1)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Retardos</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.late}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmployees > 0
                ? ((stats.late / stats.totalEmployees) * 100).toFixed(1)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas del período */}
      {periodStats && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Período</CardTitle>
            <CardDescription>Resumen de asistencia según filtros aplicados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Registros</p>
                <p className="text-2xl font-bold">{periodStats.totalRecords}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio Horas Trabajadas</p>
                <p className="text-2xl font-bold">{periodStats.averageHoursWorked}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Horas Trabajadas</p>
                <p className="text-2xl font-bold">{periodStats.totalHoursWorked}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Fecha inicio"
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="Fecha fin"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PRESENT">Presentes</SelectItem>
                <SelectItem value="ABSENT">Ausentes</SelectItem>
                <SelectItem value="JUSTIFIED">Justificados</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Buscar empleado..."
              />
            </div>
            <Button onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de asistencia */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Asistencia</CardTitle>
          <CardDescription>
            {records.length > 0
              ? `Mostrando ${records.length} registros`
              : 'No hay registros para el período seleccionado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay registros de asistencia para mostrar
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Intenta ajustar los filtros o registra una nueva marcación
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {record.employee.firstName} {record.employee.lastName}
                        </div>
                        {record.employee.department && (
                          <div className="text-xs text-muted-foreground">
                            {record.employee.department}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.employee.employeeNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.employee.position || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? (
                        <div className="flex items-center gap-2">
                          <span>{record.checkIn.substring(0, 5)}</span>
                          {record.isLate && record.lateMinutes > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{record.lateMinutes}min
                            </Badge>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? record.checkOut.substring(0, 5) : '-'}
                    </TableCell>
                    <TableCell>{record.hoursWorked.toFixed(1)}h</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
