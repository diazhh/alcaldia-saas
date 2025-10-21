'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Download, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees, useEmployeeStats } from '@/hooks/hr/useEmployees';
import EmployeeTable from '@/components/modules/hr/EmployeeTable';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página de gestión de empleados
 */
export default function EmpleadosPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    search: '',
  });

  const { data: employeesData, isLoading } = useEmployees(filters);
  const { data: stats } = useEmployeeStats();

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusChange = (value) => {
    setFilters({ ...filters, status: value === 'all' ? '' : value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Personal</h1>
          <p className="text-muted-foreground mt-1">
            Administrar empleados y expedientes digitales
          </p>
        </div>
        <Link href="/rrhh/empleados/nuevo">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="text-2xl font-bold">{stats.total}</div>
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="text-2xl font-bold text-green-600">{stats.totalActive}</div>
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="text-2xl font-bold text-gray-600">{stats.totalInactive}</div>
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nuevos (Este Mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, cédula o número de empleado..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="INACTIVE">Inactivos</SelectItem>
                <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                <SelectItem value="RETIRED">Retirados</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Más Filtros
            </Button>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de empleados */}
      <Card>
        <CardContent className="pt-6">
          <EmployeeTable
            data={employeesData?.data || []}
            pagination={employeesData?.pagination}
            isLoading={isLoading}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
