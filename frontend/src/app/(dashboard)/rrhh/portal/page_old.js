'use client';

import { Download, Calendar, Clock, FileText, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';

/**
 * Portal del Empleado
 * Vista para que cada empleado consulte su información personal
 */
export default function PortalEmpleadoPage() {
  const { user } = useAuth();

  // Mock data - en producción vendría de los hooks
  const recentPayrolls = [
    {
      id: '1',
      reference: 'NOM-2025-01-Q1',
      period: 'Primera Quincena Enero',
      paymentDate: '2025-01-15',
      grossSalary: 500,
      deductions: 50,
      netSalary: 450,
    },
    {
      id: '2',
      reference: 'NOM-2024-12-Q2',
      period: 'Segunda Quincena Diciembre',
      paymentDate: '2024-12-31',
      grossSalary: 500,
      deductions: 50,
      netSalary: 450,
    },
  ];

  const vacationRequests = [
    {
      id: '1',
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      requestedDays: 15,
      status: 'PENDING',
      reason: 'Vacaciones anuales',
    },
  ];

  const attendanceRecords = [
    {
      id: '1',
      date: '2025-01-10',
      checkIn: '08:00',
      checkOut: '17:00',
      hoursWorked: 9,
      status: 'PRESENT',
    },
    {
      id: '2',
      date: '2025-01-09',
      checkIn: '08:15',
      checkOut: '17:00',
      hoursWorked: 8.75,
      status: 'PRESENT',
      isLate: true,
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { label: 'Pendiente', className: 'bg-yellow-500' },
      APPROVED: { label: 'Aprobada', className: 'bg-green-500' },
      REJECTED: { label: 'Rechazada', className: 'bg-red-500' },
      PRESENT: { label: 'Presente', className: 'bg-green-500' },
      ABSENT: { label: 'Ausente', className: 'bg-red-500' },
    };
    const config = variants[status] || variants.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Portal del Empleado</h1>
        <p className="text-muted-foreground mt-1">
          Consulta tu información personal, recibos de pago y solicitudes
        </p>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Días de Vacaciones</CardDescription>
            <CardTitle className="text-3xl">15</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Asistencia del Mes</CardDescription>
            <CardTitle className="text-3xl">95%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">19 de 20 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Último Pago</CardDescription>
            <CardTitle className="text-3xl">$450</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">15 Ene 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Solicitudes Pendientes</CardDescription>
            <CardTitle className="text-3xl">1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Vacaciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con información */}
      <Tabs defaultValue="recibos" className="w-full">
        <TabsList>
          <TabsTrigger value="recibos">
            <FileText className="w-4 h-4 mr-2" />
            Recibos de Pago
          </TabsTrigger>
          <TabsTrigger value="vacaciones">
            <Calendar className="w-4 h-4 mr-2" />
            Vacaciones
          </TabsTrigger>
          <TabsTrigger value="asistencia">
            <Clock className="w-4 h-4 mr-2" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-2" />
            Mi Perfil
          </TabsTrigger>
        </TabsList>

        {/* Recibos de Pago */}
        <TabsContent value="recibos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recibos de Pago</CardTitle>
              <CardDescription>
                Consulta y descarga tus recibos de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Salario Bruto</TableHead>
                    <TableHead>Deducciones</TableHead>
                    <TableHead>Salario Neto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-mono text-sm">
                        {payroll.reference}
                      </TableCell>
                      <TableCell>{payroll.period}</TableCell>
                      <TableCell>
                        {new Date(payroll.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${payroll.grossSalary.toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">
                        -${payroll.deductions.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${payroll.netSalary.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vacaciones */}
        <TabsContent value="vacaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mis Vacaciones</CardTitle>
                  <CardDescription>
                    Gestiona tus solicitudes de vacaciones
                  </CardDescription>
                </div>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Días Disponibles</p>
                    <p className="text-2xl font-bold">15 días</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Días Pendientes</p>
                    <p className="text-2xl font-bold">15 días</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Días Usados</p>
                    <p className="text-2xl font-bold">0 días</p>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Días Solicitados</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {new Date(request.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(request.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{request.requestedDays} días</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asistencia */}
        <TabsContent value="asistencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Asistencia</CardTitle>
              <CardDescription>
                Consulta tu registro de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Horas Trabajadas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {record.checkIn}
                        {record.isLate && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Retardo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.hoursWorked}h</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mi Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Información Personal</CardTitle>
              <CardDescription>
                Consulta y actualiza tu información
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre Completo</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{user?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo</p>
                    <p className="font-medium">-</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline">
                    Actualizar Información
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
