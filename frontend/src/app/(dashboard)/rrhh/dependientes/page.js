'use client';

import { useState } from 'react';
import { Users, Baby, Heart, UserPlus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDependents, useDependentStats } from '@/hooks/hr/useDependents';
import { Skeleton } from '@/components/ui/skeleton';
import DependentsTable from '@/components/modules/hr/DependentsTable';
import CreateDependentDialog from '@/components/modules/hr/CreateDependentDialog';

/**
 * Página de gestión de dependientes
 */
export default function DependientesPage() {
  const [showCreateDependent, setShowCreateDependent] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    relationship: '',
  });

  const { data: dependentsData, isLoading } = useDependents(filters);
  const { data: stats, isLoading: statsLoading } = useDependentStats();

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleRelationshipChange = (value) => {
    setFilters({ ...filters, relationship: value === 'all' ? '' : value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dependientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de dependientes y beneficiarios del personal
          </p>
        </div>
        <Button onClick={() => setShowCreateDependent(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar Dependiente
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Dependientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Baby className="w-4 h-4" />
              Hijos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats?.byRelationship?.CHILD || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Cónyuges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-pink-600">{stats?.byRelationship?.SPOUSE || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Con Seguro Médico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.withHealthInsurance || 0}</div>
            )}
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
                  placeholder="Buscar por nombre del dependiente o empleado..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.relationship || 'all'} onValueChange={handleRelationshipChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Relación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las relaciones</SelectItem>
                <SelectItem value="CHILD">Hijos</SelectItem>
                <SelectItem value="SPOUSE">Cónyuge</SelectItem>
                <SelectItem value="PARENT">Padres</SelectItem>
                <SelectItem value="SIBLING">Hermanos</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Más Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de dependientes */}
      <Card>
        <CardContent className="pt-6">
          <DependentsTable
            data={dependentsData?.data || []}
            pagination={dependentsData?.pagination}
            isLoading={isLoading}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <CreateDependentDialog
        open={showCreateDependent}
        onOpenChange={setShowCreateDependent}
      />
    </div>
  );
}
