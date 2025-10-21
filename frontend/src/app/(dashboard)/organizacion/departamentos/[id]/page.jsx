'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Users, Building2, Shield, Activity } from 'lucide-react';
import { useDepartment, useDeleteDepartment } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Página de detalle de un departamento específico
 * Muestra información completa con tabs
 */
export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const { data: department, isLoading, error } = useDepartment(params.id);
  const deleteDepartment = useDeleteDepartment();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este departamento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteDepartment.mutateAsync(params.id);
      toast({
        title: 'Departamento eliminado',
        description: 'El departamento ha sido eliminado exitosamente.',
      });
      router.push('/organizacion/departamentos');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'No se pudo eliminar el departamento',
        variant: 'destructive',
      });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      DIRECCION: 'bg-blue-100 text-blue-800',
      COORDINACION: 'bg-green-100 text-green-800',
      DEPARTAMENTO: 'bg-purple-100 text-purple-800',
      UNIDAD: 'bg-orange-100 text-orange-800',
      SECCION: 'bg-pink-100 text-pink-800',
      OFICINA: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      JEFE: 'bg-blue-100 text-blue-800',
      SUBJEFE: 'bg-green-100 text-green-800',
      COORDINADOR: 'bg-purple-100 text-purple-800',
      EMPLEADO: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || 'No se pudo cargar el departamento'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{department.name}</h1>
              <Badge className={getTypeColor(department.type)}>
                {department.type}
              </Badge>
              {department.isActive ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Activo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  Inactivo
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Código: {department.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteDepartment.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="personal">
            <Users className="h-4 w-4 mr-2" />
            Personal ({department._count?.users || 0})
          </TabsTrigger>
          <TabsTrigger value="permisos">
            <Shield className="h-4 w-4 mr-2" />
            Permisos
          </TabsTrigger>
          <TabsTrigger value="actividad">
            <Activity className="h-4 w-4 mr-2" />
            Actividad
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información General */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos Básicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código</p>
                  <p className="text-sm">{department.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p className="text-sm">{department.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-sm">{department.type}</p>
                </div>
                {department.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                    <p className="text-sm">{department.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <p className="text-sm">{department.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p className="text-sm">
                    {format(new Date(department.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {department.phone ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-sm">{department.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay teléfono registrado</p>
                )}
                {department.email ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{department.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay email registrado</p>
                )}
                {department.location ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                    <p className="text-sm">{department.location}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay ubicación registrada</p>
                )}
                {department.maxEmployees && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Máximo de Empleados</p>
                    <p className="text-sm">{department.maxEmployees}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Jerarquía */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {department.parent && (
              <Card>
                <CardHeader>
                  <CardTitle>Departamento Padre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{department.parent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {department.parent.code} - {department.parent.type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {department.children && department.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subdepartamentos ({department.children.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {department.children.slice(0, 3).map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.code}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {child._count?.users || 0} empleados
                      </Badge>
                    </div>
                  ))}
                  {department.children.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{department.children.length - 3} más
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Personal */}
        <TabsContent value="personal" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Personal Asignado</h3>
              <p className="text-sm text-muted-foreground">
                {department._count?.users || 0} empleados en este departamento
              </p>
            </div>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Asignar Empleado
            </Button>
          </div>

          {department.users && department.users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {department.users.map((userDept) => (
                <Card key={userDept.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={userDept.user.avatar} />
                        <AvatarFallback>
                          {userDept.user.firstName[0]}
                          {userDept.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {userDept.user.firstName} {userDept.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {userDept.user.email}
                            </p>
                            {userDept.user.phone && (
                              <p className="text-xs text-muted-foreground">
                                {userDept.user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getRoleColor(userDept.departmentRole)}>
                            {userDept.departmentRole}
                          </Badge>
                          {userDept.isPrimary && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Principal
                            </Badge>
                          )}
                          <Badge variant="outline">{userDept.user.role}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">
                  No hay personal asignado a este departamento
                </p>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Asignar primer empleado
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Permisos */}
        <TabsContent value="permisos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permisos del Departamento</CardTitle>
              <CardDescription>
                Permisos y accesos configurados por módulo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.permissions && department.permissions.length > 0 ? (
                <div className="space-y-2">
                  {department.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{permission.module}</p>
                        <p className="text-sm text-muted-foreground">
                          {permission.permissions.join(', ')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No hay permisos específicos configurados
                  </p>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Configurar permisos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Actividad */}
        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
              <CardDescription>
                Historial de cambios y acciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  El registro de actividad estará disponible próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
