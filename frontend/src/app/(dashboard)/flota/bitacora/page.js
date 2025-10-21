'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Calendar, User, Car, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTripLogs, getVehicles } from '@/services/fleet.service';
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
import TripLogDialog from '@/components/modules/fleet/TripLogDialog';
import TripLogDetailsDialog from '@/components/modules/fleet/TripLogDetailsDialog';

export default function TripLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTripLog, setSelectedTripLog] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: tripLogsData, isLoading: isLoadingTrips } = useQuery({
    queryKey: ['tripLogs', page, limit, statusFilter, vehicleFilter, searchTerm],
    queryFn: () =>
      getTripLogs({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vehicleId: vehicleFilter !== 'all' ? vehicleFilter : undefined,
        search: searchTerm || undefined,
      }),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', { limit: 1000 }],
    queryFn: () => getVehicles({ limit: 1000 }),
  });

  const tripLogs = tripLogsData?.data || [];
  const pagination = tripLogsData?.pagination || {};
  const vehicles = vehiclesData?.data || [];

  const getStatusBadge = (status) => {
    const variants = {
      IN_PROGRESS: { variant: 'default', label: 'En Progreso' },
      COMPLETED: { variant: 'success', label: 'Completado' },
      CANCELLED: { variant: 'destructive', label: 'Cancelado' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bitácora de Viajes</h1>
          <p className="text-muted-foreground">
            Registro de todos los viajes realizados por la flota
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Viaje
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra los registros de viajes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por conductor, destino..."
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
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
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

      {/* Trip Logs List */}
      <div className="grid gap-4">
        {isLoadingTrips ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Cargando viajes...</p>
            </CardContent>
          </Card>
        ) : tripLogs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No se encontraron viajes registrados
              </p>
            </CardContent>
          </Card>
        ) : (
          tripLogs.map((trip) => (
            <Card
              key={trip.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => setSelectedTripLog(trip)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {trip.vehicle?.plate} - {trip.vehicle?.brand}{' '}
                          {trip.vehicle?.model}
                        </span>
                      </div>
                      {getStatusBadge(trip.status)}
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Conductor: {trip.driver?.firstName} {trip.driver?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(trip.startDate), "d 'de' MMMM, yyyy HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Destino: {trip.destination}</span>
                      </div>
                      {trip.endDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Finalizado:{' '}
                            {format(new Date(trip.endDate), "d 'de' MMMM, yyyy HH:mm", {
                              locale: es,
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Km Inicial: {trip.startKm.toLocaleString()}</span>
                      {trip.endKm && (
                        <>
                          <span>Km Final: {trip.endKm.toLocaleString()}</span>
                          <span className="font-semibold text-foreground">
                            Recorrido: {(trip.endKm - trip.startKm).toLocaleString()} km
                          </span>
                        </>
                      )}
                    </div>

                    {trip.purpose && (
                      <p className="text-sm text-muted-foreground">
                        Motivo: {trip.purpose}
                      </p>
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
            {Math.min(page * limit, pagination.total)} de {pagination.total} viajes
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
      <TripLogDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      {selectedTripLog && (
        <TripLogDetailsDialog
          tripLog={selectedTripLog}
          open={!!selectedTripLog}
          onOpenChange={(open) => !open && setSelectedTripLog(null)}
        />
      )}
    </div>
  );
}
