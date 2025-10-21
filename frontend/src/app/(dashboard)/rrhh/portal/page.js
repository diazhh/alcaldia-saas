'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, Clock, FileText, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import api from '@/lib/api';

export default function PortalEmpleadoPage() {
  const { user } = useAuth();
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/portal/my-data');
      setPortalData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos del portal:', err);
      setError('No se pudieron cargar tus datos. Verifica que tengas un registro de empleado.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portal del Empleado</h1>
          <p className="text-muted-foreground mt-1">
            Consulta tu información personal, recibos de pago y solicitudes
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
            <Button onClick={fetchPortalData} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, recentPayrolls, vacationRequests, vacationBalance, attendanceRecords, employee } = portalData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portal del Empleado</h1>
        <p className="text-muted-foreground mt-1">
          Consulta tu información personal, recibos de pago y solicitudes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Días de Vacaciones</CardDescription>
            <CardTitle className="text-3xl">{summary.vacationDays}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Asistencia del Mes</CardDescription>
            <CardTitle className="text-3xl">{summary.attendancePercentage}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{summary.attendanceDays} días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Último Pago</CardDescription>
            <CardTitle className="text-3xl">
              ${summary.lastPayment ? summary.lastPayment.amount.toFixed(2) : '0.00'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {summary.lastPayment
                ? new Date(summary.lastPayment.date).toLocaleDateString()
                : 'Sin pagos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Solicitudes Pendientes</CardDescription>
            <CardTitle className="text-3xl">{summary.pendingRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Vacaciones y permisos</p>
          </CardContent>
        </Card>
      </div>

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

        <TabsContent value="recibos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recibos de Pago</CardTitle>
              <CardDescription>Consulta y descarga tus recibos de pago</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayrolls.length > 0 ? (
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
                        <TableCell className="font-mono text-sm">{payroll.reference}</TableCell>
                        <TableCell>{payroll.period}</TableCell>
                        <TableCell>{new Date(payroll.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>${payroll.grossSalary.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">-${payroll.totalDeductions.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">${payroll.netSalary.toFixed(2)}</TableCell>
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
              ) : (
                <p className="text-muted-foreground text-sm">No tienes recibos de pago registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mis Vacaciones</CardTitle>
                  <CardDescription>Gestiona tus solicitudes de vacaciones</CardDescription>
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
                    <p className="text-2xl font-bold">{vacationBalance.available} días</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Días Pendientes</p>
                    <p className="text-2xl font-bold">{vacationBalance.pending} días</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Días Usados</p>
                    <p className="text-2xl font-bold">{vacationBalance.used} días</p>
                  </div>
                </div>
              </div>

              {vacationRequests.length > 0 ? (
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
                        <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{request.requestedDays} días</TableCell>
                        <TableCell>{request.reason || '-'}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm">No tienes solicitudes de vacaciones</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asistencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Asistencia</CardTitle>
              <CardDescription>Consulta tu registro de asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
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
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {record.checkIn || '-'}
                          {record.isLate && (
                            <Badge variant="outline" className="ml-2 text-xs">Retardo</Badge>
                          )}
                        </TableCell>
                        <TableCell>{record.checkOut || '-'}</TableCell>
                        <TableCell>{record.hoursWorked}h</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm">No hay registros de asistencia</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Información Personal</CardTitle>
              <CardDescription>Consulta y actualiza tu información</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre Completo</p>
                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo</p>
                    <p className="font-medium">{employee.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departamento</p>
                    <p className="font-medium">{employee.department || '-'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline">Actualizar Información</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
