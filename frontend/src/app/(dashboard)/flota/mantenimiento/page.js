'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Calendar, Car, Wrench, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMaintenances, getVehicles } from '@/services/fleet.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaintenanceDialog from '@/components/modules/fleet/MaintenanceDialog';
import MaintenanceDetailsDialog from '@/components/modules/fleet/MaintenanceDetailsDialog';

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: maintenancesData, isLoading } = useQuery({
    queryKey: [
      'maintenances',
      page,
      limit,
      statusFilter,
      typeFilter,
      vehicleFilter,
      searchTerm,
    ],
    queryFn: () =>
      getMaintenances({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        vehicleId: vehicleFilter !== 'all' ? vehicleFilter : undefined,
        search: searchTerm || undefined,
      }),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', { limit: 1000 }],
    queryFn: () => getVehicles({ limit: 1000 }),
  });

  const maintenances = maintenancesData?.data || [];
  const pagination = maintenancesData?.pagination || {};
  const vehicles = vehiclesData?.data || [];

  const getStatusBadge = (status) => {
    const variants = {
      SCHEDULED: { variant: 'default', label: 'Programado' },
      IN_PROGRESS: { variant: 'secondary', label: 'En Progreso' },
      COMPLETED: { variant: 'success', label: 'Completado' },
      CANCELLED: { variant: 'destructive', label: 'Cancelado' },
      OVERDUE: { variant: 'destructive', label: 'Vencido' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      PREVENTIVE: { variant: 'outline', label: 'Preventivo' },
      CORRECTIVE: { variant: 'outline', label: 'Correctivo' },
      INSPECTION: { variant: 'outline', label: 'Inspección' },
      TIRE_CHANGE: { variant: 'outline', label: 'Cambio de Neumáticos' },
      OIL_CHANGE: { variant: 'outline', label: 'Cambio de Aceite' },
      OTHER: { variant: 'outline', label: 'Otro' },
    };
    const config = variants[type] || { variant: 'outline', label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Mantenimiento
          </h1>
          <p className="text-muted-foreground">
            Programación y seguimiento de mantenimientos preventivos y correctivos
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Programar Mantenimiento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Busca y filtra los mantenimientos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SCHEDULED">Programado</SelectItem>
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="OVERDUE">Vencido</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                <SelectItem value="CORRECTIVE">Correctivo</SelectItem>
                <SelectItem value="INSPECTION">Inspección</SelectItem>
                <SelectItem value="TIRE_CHANGE">Cambio de Neumáticos</SelectItem>
                <SelectItem value="OIL_CHANGE">Cambio de Aceite</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenances List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Cargando mantenimientos...
              </p>
            </CardContent>
          </Card>
        ) : maintenances.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No se encontraron mantenimientos
              </p>
            </CardContent>
          </Card>
        ) : (
          maintenances.map((maintenance) => (
            <Card
              key={maintenance.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => setSelectedMaintenance(maintenance)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {maintenance.vehicle?.plate} - {maintenance.vehicle?.brand}{' '}
                          {maintenance.vehicle?.model}
                        </span>
                      </div>
                      {getTypeBadge(maintenance.type)}
                      {getStatusBadge(maintenance.status)}
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span>{maintenance.description || 'Sin descripción'}</span>
                      </div>
                      {maintenance.scheduledDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Programado:{' '}
                            {format(
                              new Date(maintenance.scheduledDate),
                              "d 'de' MMMM, yyyy",
                              { locale: es }
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {maintenance.scheduledKm && (
                      <div className="text-sm text-muted-foreground">
                        Kilometraje programado: {maintenance.scheduledKm.toLocaleString()}{' '}
                        km
                      </div>
                    )}

                    {maintenance.cost && (
                      <div className="text-sm font-semibold">
                        Costo: Bs. {maintenance.cost.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * limit + 1} a{' '}
            {Math.min(page * limit, pagination.total)} de {pagination.total}{' '}
            mantenimientos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <MaintenanceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      {selectedMaintenance && (
        <MaintenanceDetailsDialog
          maintenance={selectedMaintenance}
          open={!!selectedMaintenance}
          onOpenChange={(open) => !open && setSelectedMaintenance(null)}
        />
      )}
    </div>
  );
}
