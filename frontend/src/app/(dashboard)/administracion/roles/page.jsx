'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { GRANULAR_PERMISSIONS } from '@/constants/permissions';
import api from '@/lib/api';
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
} from 'lucide-react';

export default function RolesPage() {
  const { can, loading: permissionsLoading } = usePermissions();
  const [selectedRole, setSelectedRole] = useState(null);

  // Cargar roles personalizados
  const { data: roles, isLoading: rolesLoading, refetch } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: async () => {
      const response = await api.get('/custom-roles');
      return response.data?.data || [];
    },
  });

  // Verificar permisos
  const canView = can(GRANULAR_PERMISSIONS.ADMIN.ROLES.VER);
  const canCreate = can(GRANULAR_PERMISSIONS.ADMIN.ROLES.CREAR);
  const canModify = can(GRANULAR_PERMISSIONS.ADMIN.ROLES.MODIFICAR);
  const canDelete = can(GRANULAR_PERMISSIONS.ADMIN.ROLES.ELIMINAR);

  if (permissionsLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-6 w-6" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No tienes permisos para ver los roles personalizados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles Personalizados</h1>
          <p className="text-gray-600 mt-1">
            Gestiona roles y asigna permisos granulares
          </p>
        </div>
        {canCreate && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Rol
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles?.length || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              Roles configurados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Roles del Sistema
            </CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles?.filter((r) => r.isSystem).length || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Roles predefinidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Activos</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles?.filter((r) => r.isActive).length || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Roles habilitados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Roles</CardTitle>
          <CardDescription>
            Roles personalizados con sus permisos asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-md">
                      {role.description || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="secondary">Sistema</Badge>
                      ) : (
                        <Badge variant="outline">Personalizado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {role.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRole(role)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canModify && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && !role.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">
                        No hay roles configurados
                      </p>
                      {canCreate && (
                        <Button variant="outline" className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Rol
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acerca de los Roles Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>
            <strong>Roles del Sistema:</strong> Son roles predefinidos que vienen
            configurados con el sistema y no pueden ser eliminados. Puedes
            modificar sus permisos según las necesidades de tu organización.
          </p>
          <p>
            <strong>Roles Personalizados:</strong> Son roles creados por los
            administradores del sistema para casos de uso específicos. Pueden ser
            modificados o eliminados en cualquier momento.
          </p>
          <p>
            <strong>Permisos Granulares:</strong> Cada rol puede tener permisos
            específicos a nivel de módulo, interfaz y acción. Por ejemplo:
            "finanzas.cajas_chicas.aprobar".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
