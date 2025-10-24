'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Building2, 
  Users, 
  Edit, 
  Trash2, 
  UserPlus, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useDepartment, useDeleteDepartment } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import EditDepartmentModal from './EditDepartmentModal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Componente para mostrar los detalles de un departamento
 */
export default function DepartmentDetails({ department: initialDepartment }) {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Obtener datos completos del departamento
  const { data: department, isLoading } = useDepartment(initialDepartment.id);
  const deleteDepartment = useDeleteDepartment();

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el departamento "${department.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteDepartment.mutateAsync(department.id);
      toast({
        title: 'Departamento eliminado',
        description: 'El departamento ha sido eliminado exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar el departamento',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No se pudo cargar la información del departamento</p>
      </div>
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'DIRECCION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'COORDINACION':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'DEPARTAMENTO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'UNIDAD':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'SECCION':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'OFICINA':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'JEFE':
        return 'bg-blue-100 text-blue-800';
      case 'SUBJEFE':
        return 'bg-green-100 text-green-800';
      case 'COORDINADOR':
        return 'bg-purple-100 text-purple-800';
      case 'EMPLEADO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con información básica */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{department.name}</h2>
            <Badge className={getTypeColor(department.type)}>
              {department.type}
            </Badge>
            {department.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Inactivo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Código: {department.code}</p>
          {department.description && (
            <p className="text-sm">{department.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleteDepartment.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteDepartment.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      {/* Tabs con información detallada */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="personal">
            Personal ({department._count?.users || 0})
          </TabsTrigger>
          <TabsTrigger value="jerarquia">Jerarquía</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
        </TabsList>

        {/* Tab: Información General */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código</p>
                <p className="text-sm">{department.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-sm">{department.type}</p>
              </div>
              {department.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </p>
                  <p className="text-sm">{department.phone}</p>
                </div>
              )}
              {department.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-sm">{department.email}</p>
                </div>
              )}
              {department.location && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Ubicación
                  </p>
                  <p className="text-sm">{department.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Creado
                </p>
                <p className="text-sm">
                  {format(new Date(department.createdAt), 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-sm">{department.isActive ? 'Activo' : 'Inactivo'}</p>
              </div>
            </CardContent>
          </Card>

          {department.parent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Departamento Padre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
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
                <CardTitle className="text-lg">
                  Subdepartamentos ({department.children.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {department.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{child.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {child.code} - {child.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {child._count?.users || 0} empleados
                        </Badge>
                        {!child.isActive && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar Empleado
            </Button>
          </div>

          {department.users && department.users.length > 0 ? (
            <div className="space-y-2">
              {department.users.map((userDept) => (
                <Card key={userDept.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={userDept.user.avatar} />
                          <AvatarFallback>
                            {userDept.user.firstName[0]}
                            {userDept.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {userDept.user.firstName} {userDept.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {userDept.user.email}
                          </p>
                          {userDept.user.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {userDept.user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">No hay personal asignado a este departamento</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Asignar primer empleado
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Jerarquía */}
        <TabsContent value="jerarquia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posición en la Jerarquía</CardTitle>
              <CardDescription>
                Ubicación del departamento en la estructura organizacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Información de jerarquía disponible próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Permisos */}
        <TabsContent value="permisos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permisos del Departamento</CardTitle>
              <CardDescription>
                Permisos y accesos configurados para este departamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.permissions && department.permissions.length > 0 ? (
                <div className="space-y-2">
                  {department.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{permission.module}</p>
                        <p className="text-xs text-muted-foreground">
                          {permission.permissions.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay permisos específicos configurados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de edición */}
      <EditDepartmentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        department={department}
      />
    </div>
  );
}

DepartmentDetails.propTypes = {
  department: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};
