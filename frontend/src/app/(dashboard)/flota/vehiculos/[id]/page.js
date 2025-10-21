'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Car, Fuel, Wrench, MapPin, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getVehicleById } from '@/services/fleet.service';
import VehicleDialog from '@/components/modules/fleet/VehicleDialog';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const data = await getVehicleById(params.id);
      setVehicle(data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      toast.error('Error al cargar vehículo');
      router.push('/flota/vehiculos');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    if (refresh) fetchVehicle();
  };

  const getStatusColor = (status) => {
    const colors = {
      OPERATIONAL: 'bg-green-100 text-green-800',
      IN_REPAIR: 'bg-amber-100 text-amber-800',
      OUT_OF_SERVICE: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      OPERATIONAL: 'Operativo',
      IN_REPAIR: 'En Reparación',
      OUT_OF_SERVICE: 'Fuera de Servicio',
      MAINTENANCE: 'Mantenimiento',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      SEDAN: 'Sedán',
      PICKUP: 'Pickup',
      TRUCK: 'Camión',
      VAN: 'Van',
      BUS: 'Autobús',
      MOTORCYCLE: 'Motocicleta',
      OTHER: 'Otro',
    };
    return labels[type] || type;
  };

  const getFuelTypeLabel = (fuelType) => {
    const labels = {
      GASOLINE: 'Gasolina',
      DIESEL: 'Diésel',
      ELECTRIC: 'Eléctrico',
      HYBRID: 'Híbrido',
      GAS: 'Gas',
    };
    return labels[fuelType] || fuelType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">Cargando vehículo...</div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/flota/vehiculos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-gray-600 mt-1">
              {vehicle.code} • {vehicle.plate}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(vehicle.status)}>
            {getStatusLabel(vehicle.status)}
          </Badge>
          <Button onClick={() => setDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* General Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Kilometraje Actual</CardDescription>
            <CardTitle className="text-2xl">
              {vehicle.currentMileage?.toLocaleString()} km
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Valor Actual</CardDescription>
            <CardTitle className="text-2xl">
              ${vehicle.currentValue?.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Año</CardDescription>
            <CardTitle className="text-2xl">{vehicle.year}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tipo</CardDescription>
            <CardTitle className="text-2xl">{getTypeLabel(vehicle.type)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Car className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="trips">
            <MapPin className="h-4 w-4 mr-2" />
            Viajes
          </TabsTrigger>
          <TabsTrigger value="fuel">
            <Fuel className="h-4 w-4 mr-2" />
            Combustible
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            Mantenimiento
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Marca</label>
                  <p className="mt-1">{vehicle.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Modelo</label>
                  <p className="mt-1">{vehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Año</label>
                  <p className="mt-1">{vehicle.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <p className="mt-1">{vehicle.color}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Combustible</label>
                  <p className="mt-1">{getFuelTypeLabel(vehicle.fuelType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacidad</label>
                  <p className="mt-1">{vehicle.capacity} personas</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">VIN</label>
                  <p className="mt-1">{vehicle.vin || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Motor</label>
                  <p className="mt-1">{vehicle.engineNumber || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Adquisición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Adquisición</label>
                  <p className="mt-1">
                    {vehicle.acquisitionDate
                      ? new Date(vehicle.acquisitionDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor de Adquisición</label>
                  <p className="mt-1">${vehicle.acquisitionValue?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor Actual</label>
                  <p className="mt-1">${vehicle.currentValue?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Depreciación</label>
                  <p className="mt-1 text-red-600">
                    ${(vehicle.acquisitionValue - vehicle.currentValue)?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trips Tab */}
        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Viajes</CardTitle>
              <CardDescription>
                Últimos 10 viajes registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.tripLogs && vehicle.tripLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Conductor</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Distancia</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.tripLogs.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          {new Date(trip.departureDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{trip.driverName}</TableCell>
                        <TableCell>{trip.destination}</TableCell>
                        <TableCell>{trip.distance ? `${trip.distance} km` : 'En curso'}</TableCell>
                        <TableCell>
                          <Badge variant={trip.returnDate ? 'default' : 'secondary'}>
                            {trip.returnDate ? 'Completado' : 'En curso'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No hay viajes registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Tab */}
        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Combustible</CardTitle>
              <CardDescription>
                Últimas 10 cargas de combustible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.fuelControls && vehicle.fuelControls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Litros</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Kilometraje</TableHead>
                      <TableHead>Rendimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.fuelControls.map((fuel) => (
                      <TableRow key={fuel.id}>
                        <TableCell>
                          {new Date(fuel.loadDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{fuel.loadedLiters} L</TableCell>
                        <TableCell>${fuel.cost?.toLocaleString()}</TableCell>
                        <TableCell>{fuel.mileageAtLoad?.toLocaleString()} km</TableCell>
                        <TableCell>
                          {fuel.efficiency ? `${fuel.efficiency.toFixed(2)} km/L` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No hay cargas de combustible registradas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Mantenimiento</CardTitle>
              <CardDescription>
                Últimos 10 mantenimientos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.maintenances && vehicle.maintenances.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.maintenances.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell>
                          {new Date(maintenance.scheduledDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={maintenance.type === 'PREVENTIVE' ? 'default' : 'destructive'}>
                            {maintenance.type === 'PREVENTIVE' ? 'Preventivo' : 'Correctivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{maintenance.description}</TableCell>
                        <TableCell>
                          ${maintenance.totalCost?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            maintenance.status === 'COMPLETED' ? 'default' :
                            maintenance.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                          }>
                            {maintenance.status === 'COMPLETED' ? 'Completado' :
                             maintenance.status === 'IN_PROGRESS' ? 'En Progreso' : 'Programado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No hay mantenimientos registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                Documentación del vehículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.insurances && vehicle.insurances.length > 0 ? (
                  <div>
                    <h3 className="font-medium mb-2">Seguros</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Compañía</TableHead>
                          <TableHead>Póliza</TableHead>
                          <TableHead>Vigencia</TableHead>
                          <TableHead>Prima</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicle.insurances.map((insurance) => (
                          <TableRow key={insurance.id}>
                            <TableCell>{insurance.company}</TableCell>
                            <TableCell>{insurance.policyNumber}</TableCell>
                            <TableCell>
                              {new Date(insurance.startDate).toLocaleDateString()} - {' '}
                              {new Date(insurance.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>${insurance.premium?.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={insurance.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {insurance.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No hay documentos registrados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <VehicleDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        vehicle={vehicle}
      />
    </div>
  );
}
