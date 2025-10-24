'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { MODULES, ACTIONS, getModuleLabel, getActionLabel } from '@/constants/permissions';

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-pink-100 text-pink-800 border-pink-200',
  DIRECTOR: 'bg-orange-100 text-orange-800 border-orange-200',
  COORDINADOR: 'bg-green-100 text-green-800 border-green-200',
  EMPLEADO: 'bg-blue-100 text-blue-800 border-blue-200',
  CIUDADANO: 'bg-gray-100 text-gray-800 border-gray-200',
};

const roles = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'EMPLEADO', label: 'Empleado' },
  { value: 'CIUDADANO', label: 'Ciudadano' },
];

export default function PermisosPage() {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener todos los permisos del sistema
  const { data: allPermissions, isLoading: loadingAllPerms } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const response = await api.get('/permissions/all');
      return response.data?.data || [];
    },
  });

  // Obtener permisos del rol seleccionado
  const { data: rolePermissions, isLoading: loadingRolePerms } = useQuery({
    queryKey: ['role-permissions', selectedRole],
    queryFn: async () => {
      const response = await api.get(`/permissions/role/${selectedRole}`);
      return response.data?.data || [];
    },
    enabled: !!selectedRole,
  });

  // Agrupar permisos por módulo
  const permissionsByModule = {};
  allPermissions?.forEach(perm => {
    if (!permissionsByModule[perm.module]) {
      permissionsByModule[perm.module] = [];
    }
    permissionsByModule[perm.module].push(perm);
  });

  // Filtrar módulos según búsqueda
  const filteredModules = Object.keys(permissionsByModule).filter(module =>
    getModuleLabel(module).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar si el rol tiene un permiso específico
  const hasPermission = (permissionId) => {
    return rolePermissions?.some(rp => rp.permissionId === permissionId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles y Permisos</h1>
          <p className="text-gray-600 mt-1">
            Administra los permisos de cada rol en el sistema
          </p>
        </div>
        <Button variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Documentación de Permisos
        </Button>
      </div>

      {/* Role Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Rol</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === role.value
                  ? roleColors[role.value] + ' border-2 shadow-md'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-center">
                <Shield className={`h-6 w-6 mx-auto mb-2 ${
                  selectedRole === role.value ? '' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-sm">{role.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Matriz de Permisos - {roles.find(r => r.value === selectedRole)?.label}
          </h2>

          {loadingAllPerms || loadingRolePerms ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando permisos...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredModules.map((module) => (
                <div key={module} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {getModuleLabel(module)}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
                    {permissionsByModule[module].map((permission) => {
                      const hasAccess = hasPermission(permission.id);
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center gap-2 p-2 rounded border ${
                            hasAccess
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {hasAccess ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${
                            hasAccess ? 'text-green-800 font-medium' : 'text-gray-500'
                          }`}>
                            {getActionLabel(permission.action)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total de Permisos</p>
          <p className="text-2xl font-bold text-gray-900">
            {allPermissions?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Permisos del Rol</p>
          <p className="text-2xl font-bold text-green-600">
            {rolePermissions?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Cobertura</p>
          <p className="text-2xl font-bold text-blue-600">
            {allPermissions?.length > 0
              ? Math.round((rolePermissions?.length / allPermissions?.length) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
