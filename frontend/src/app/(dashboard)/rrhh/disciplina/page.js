'use client';

import { useState } from 'react';
import { AlertTriangle, FileWarning, Ban, XCircle, Plus, Search, Filter } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisciplinaryActions, useDisciplinaryStats } from '@/hooks/hr/useDisciplinary';
import { Skeleton } from '@/components/ui/skeleton';
import DisciplinaryActionsTable from '@/components/modules/hr/DisciplinaryActionsTable';
import CreateDisciplinaryActionDialog from '@/components/modules/hr/CreateDisciplinaryActionDialog';

/**
 * Página de gestión de acciones disciplinarias
 */
export default function DisciplinaPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateAction, setShowCreateAction] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    type: '',
  });

  const { data: actionsData, isLoading } = useDisciplinaryActions(filters);
  const { data: stats, isLoading: statsLoading } = useDisciplinaryStats();

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusChange = (value) => {
    setFilters({ ...filters, status: value === 'all' ? '' : value, page: 1 });
  };

  const handleTypeChange = (value) => {
    setFilters({ ...filters, type: value === 'all' ? '' : value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Acciones Disciplinarias</h1>
          <p className="text-muted-foreground mt-1">
            Gestión del proceso disciplinario y sanciones del personal
          </p>
        </div>
        <Button onClick={() => setShowCreateAction(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Acción Disciplinaria
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileWarning className="w-4 h-4" />
              Total Casos
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
              <AlertTriangle className="w-4 h-4" />
              Casos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{stats?.active || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Suspensiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats?.byType?.SUSPENSION || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Casos Cerrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.closed || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos los Casos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="active">En Proceso</TabsTrigger>
          <TabsTrigger value="closed">Cerrados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filtros y búsqueda */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por empleado o descripción..."
                      value={filters.search}
                      onChange={handleSearch}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tipo de Acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="VERBAL_WARNING">Amonestación Verbal</SelectItem>
                    <SelectItem value="WRITTEN_WARNING">Amonestación Escrita</SelectItem>
                    <SelectItem value="SUSPENSION">Suspensión</SelectItem>
                    <SelectItem value="TERMINATION">Destitución</SelectItem>
                    <SelectItem value="FINE">Multa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="INITIATED">Iniciado</SelectItem>
                    <SelectItem value="NOTIFIED">Notificado</SelectItem>
                    <SelectItem value="EMPLOYEE_RESPONDED">Respondido</SelectItem>
                    <SelectItem value="DECIDED">Decidido</SelectItem>
                    <SelectItem value="APPEALED">Apelado</SelectItem>
                    <SelectItem value="CLOSED">Cerrado</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Más Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de acciones disciplinarias */}
          <Card>
            <CardContent className="pt-6">
              <DisciplinaryActionsTable
                data={actionsData?.data || []}
                pagination={actionsData?.pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <CreateDisciplinaryActionDialog
        open={showCreateAction}
        onOpenChange={setShowCreateAction}
      />
    </div>
  );
}
