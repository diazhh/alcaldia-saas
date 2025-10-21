'use client';

import { ArrowLeft, Edit, Download, FileText, Calendar, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployeeProfile } from '@/hooks/hr/useEmployees';
import { useVacationBalance } from '@/hooks/hr/useVacations';

/**
 * Página de expediente digital del empleado
 */
export default function EmpleadoDetailPage({ params }) {
  const { data: employee, isLoading } = useEmployeeProfile(params.id);
  const { data: vacationBalance } = useVacationBalance(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Empleado no encontrado</p>
      </div>
    );
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: { label: 'Activo', className: 'bg-green-500' },
      INACTIVE: { label: 'Inactivo', className: 'bg-gray-500' },
      SUSPENDED: { label: 'Suspendido', className: 'bg-red-500' },
      RETIRED: { label: 'Retirado', className: 'bg-blue-500' },
    };
    const config = variants[status] || variants.INACTIVE;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/rrhh/empleados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Expediente Digital</h1>
            <p className="text-muted-foreground mt-1">
              Información completa del empleado
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href={`/rrhh/empleados/${params.id}/editar`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <p className="text-muted-foreground mt-1">{employee.position?.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      {employee.employeeNumber}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {employee.idNumber}
                    </span>
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{employee.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                  <p className="font-medium">
                    {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Rápido */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Salario Base</CardDescription>
            <CardTitle className="text-2xl">${employee.baseSalary}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Días de Vacaciones</CardDescription>
            <CardTitle className="text-2xl">
              {vacationBalance?.availableDays || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Años de Servicio</CardDescription>
            <CardTitle className="text-2xl">
              {vacationBalance?.yearsOfService || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tipo de Contrato</CardDescription>
            <CardTitle className="text-lg">
              {employee.contractType === 'PERMANENT' ? 'Fijo' : 
               employee.contractType === 'TEMPORARY' ? 'Temporal' : 
               employee.contractType === 'CONTRACT' ? 'Contratado' : 'Pasante'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs con información detallada */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Datos Personales</TabsTrigger>
          <TabsTrigger value="laboral">Datos Laborales</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="capacitaciones">Capacitaciones</TabsTrigger>
        </TabsList>

        {/* Datos Personales */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium">
                    {employee.gender === 'MALE' ? 'Masculino' : 
                     employee.gender === 'FEMALE' ? 'Femenino' : 'Otro'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado Civil</p>
                  <p className="font-medium">
                    {employee.maritalStatus === 'SINGLE' ? 'Soltero/a' : 
                     employee.maritalStatus === 'MARRIED' ? 'Casado/a' : 
                     employee.maritalStatus === 'DIVORCED' ? 'Divorciado/a' : 
                     employee.maritalStatus === 'WIDOWED' ? 'Viudo/a' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{employee.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad</p>
                  <p className="font-medium">{employee.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{employee.state || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Académica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Nivel Educativo</p>
                  <p className="font-medium">
                    {employee.educationLevel === 'PRIMARY' ? 'Primaria' : 
                     employee.educationLevel === 'SECONDARY' ? 'Secundaria' : 
                     employee.educationLevel === 'TECHNICAL' ? 'Técnico' : 
                     employee.educationLevel === 'UNIVERSITY' ? 'Universitario' : 
                     employee.educationLevel === 'POSTGRADUATE' ? 'Postgrado' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profesión</p>
                  <p className="font-medium">{employee.profession || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datos Laborales */}
        <TabsContent value="laboral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium">{employee.position?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamento</p>
                  <p className="font-medium">{employee.department?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supervisor</p>
                  <p className="font-medium">
                    {employee.supervisor ? 
                      `${employee.supervisor.firstName} ${employee.supervisor.lastName}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Contrato</p>
                  <p className="font-medium">
                    {employee.contractType === 'PERMANENT' ? 'Fijo' : 
                     employee.contractType === 'TEMPORARY' ? 'Temporal' : 
                     employee.contractType === 'CONTRACT' ? 'Contratado' : 'Pasante'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Salario Base</p>
                  <p className="font-medium">${employee.baseSalary}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                  <p className="font-medium">
                    {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Bancaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium">{employee.bankName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
                  <p className="font-medium">
                    {employee.bankAccountType === 'SAVINGS' ? 'Ahorro' : 
                     employee.bankAccountType === 'CHECKING' ? 'Corriente' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                  <p className="font-medium font-mono">{employee.bankAccountNumber || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle>Documentos del Empleado</CardTitle>
              <CardDescription>
                Gestión de documentos y archivos del expediente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay documentos cargados
                </p>
                <Button className="mt-4" variant="outline">
                  Subir Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluaciones */}
        <TabsContent value="evaluaciones">
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones de Desempeño</CardTitle>
              <CardDescription>
                Historial de evaluaciones del empleado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay evaluaciones registradas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capacitaciones */}
        <TabsContent value="capacitaciones">
          <Card>
            <CardHeader>
              <CardTitle>Capacitaciones</CardTitle>
              <CardDescription>
                Historial de capacitaciones y cursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay capacitaciones registradas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
