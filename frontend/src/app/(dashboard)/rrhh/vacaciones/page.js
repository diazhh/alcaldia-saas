'use client';

import { useState } from 'react';
import { Calendar, Plus, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

/**
 * Página de gestión de vacaciones
 */
export default function VacacionesPage() {
  const [filters, setFilters] = useState({
    status: '',
    year: new Date().getFullYear(),
  });

  const isLoading = false;

  // Mock data
  const vacationRequests = [
    {
      id: '1',
      employee: {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        employeeNumber: 'EMP-2024-0001',
      },
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      requestedDays: 15,
      status: 'PENDING',
      reason: 'Vacaciones anuales',
      createdAt: '2025-01-05',
    },
    {
      id: '2',
      employee: {
        id: 'emp-2',
        firstName: 'María',
        lastName: 'González',
        employeeNumber: 'EMP-2024-0002',
      },
      startDate: '2025-08-01',
      endDate: '2025-08-10',
      requestedDays: 10,
      status: 'APPROVED',
      reason: 'Vacaciones familiares',
      createdAt: '2024-12-20',
      approvedAt: '2024-12-22',
      approvedBy: 'Supervisor',
    },
    {
      id: '3',
      employee: {
        id: 'emp-3',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        employeeNumber: 'EMP-2024-0003',
      },
      startDate: '2025-06-15',
      endDate: '2025-06-20',
      requestedDays: 6,
      status: 'REJECTED',
      reason: 'Viaje personal',
      createdAt: '2025-01-03',
      rejectedAt: '2025-01-04',
      rejectionReason: 'Período no disponible por alta carga de trabajo',
    },
  ];

  const stats = {
    pending: 5,
    approved: 12,
    rejected: 2,
    totalDays: 180,
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { label: 'Pendiente', className: 'bg-yellow-500' },
      APPROVED: { label: 'Aprobada', className: 'bg-green-500' },
      REJECTED: { label: 'Rechazada', className: 'bg-red-500' },
      CANCELLED: { label: 'Cancelada', className: 'bg-gray-500' },
    };
    const config = variants[status] || variants.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Vacaciones</h1>
          <p className="text-muted-foreground mt-1">
            Administrar solicitudes y saldos de vacaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Solicitudes Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Requieren revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aprobadas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Este año
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rechazadas</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Este año
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Días</CardDescription>
            <CardTitle className="text-3xl">{stats.totalDays}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Días de vacaciones aprobados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => 
                setFilters({ ...filters, status: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="APPROVED">Aprobadas</SelectItem>
                <SelectItem value="REJECTED">Rechazadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.year.toString()}
              onValueChange={(value) => 
                setFilters({ ...filters, year: parseInt(value) })
              }
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2024, 2023].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Vacaciones</CardTitle>
          <CardDescription>
            Gestionar solicitudes de vacaciones del personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vacationRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">
                        {request.employee.firstName} {request.employee.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.employee.employeeNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(request.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.requestedDays} días</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <Button size="sm" variant="default">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {request.status !== 'PENDING' && (
                          <Button size="sm" variant="outline">
                            Ver Detalles
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Calendario de vacaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Vacaciones</CardTitle>
          <CardDescription>
            Vista general de las vacaciones programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Calendario de vacaciones próximamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
