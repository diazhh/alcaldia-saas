'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Fuel, Wrench, Calendar, Car } from 'lucide-react';
import {
  getVehicles,
  getVehicleTCO,
  getFleetTCO,
  compareVehiclesTCO,
} from '@/services/fleet.service';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TCOPage() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const [compareVehicles, setCompareVehicles] = useState([]);

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ status: 'ACTIVE' }),
  });

  // Fetch fleet TCO
  const { data: fleetTCO, isLoading: isLoadingFleet } = useQuery({
    queryKey: ['fleetTCO', selectedPeriod],
    queryFn: () => getFleetTCO({ months: parseInt(selectedPeriod) }),
  });

  // Fetch vehicle TCO
  const { data: vehicleTCO, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ['vehicleTCO', selectedVehicle, selectedPeriod],
    queryFn: () => getVehicleTCO(selectedVehicle, { months: parseInt(selectedPeriod) }),
    enabled: !!selectedVehicle,
  });

  // Fetch comparison
  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['compareVehiclesTCO', compareVehicles, selectedPeriod],
    queryFn: () => compareVehiclesTCO(compareVehicles, { months: parseInt(selectedPeriod) }),
    enabled: compareVehicles.length >= 2,
  });

  const vehicles = vehiclesData?.data || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const handleAddToCompare = (vehicleId) => {
    if (!compareVehicles.includes(vehicleId) && compareVehicles.length < 5) {
      setCompareVehicles([...compareVehicles, vehicleId]);
    }
  };

  const handleRemoveFromCompare = (vehicleId) => {
    setCompareVehicles(compareVehicles.filter((id) => id !== vehicleId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Costo Total de Propiedad (TCO)</h1>
        <p className="text-gray-600 mt-1">
          Análisis completo de costos operativos de la flota municipal
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-4 items-center">
        <span className="text-sm font-medium">Período de análisis:</span>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último año</SelectItem>
            <SelectItem value="24">Últimos 2 años</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="fleet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet">Flota Completa</TabsTrigger>
          <TabsTrigger value="vehicle">Por Vehículo</TabsTrigger>
          <TabsTrigger value="compare">Comparar Vehículos</TabsTrigger>
        </TabsList>

        {/* Fleet TCO Tab */}
        <TabsContent value="fleet" className="space-y-4">
          {isLoadingFleet ? (
            <div className="text-center py-8">Cargando datos...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      TCO Total
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      {formatCurrency(fleetTCO?.totalTCO)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      Combustible
                    </CardDescription>
                    <CardTitle className="text-2xl text-amber-600">
                      {formatCurrency(fleetTCO?.fuelCost)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Mantenimiento
                    </CardDescription>
                    <CardTitle className="text-2xl text-purple-600">
                      {formatCurrency(fleetTCO?.maintenanceCost)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Costo por km
                    </CardDescription>
                    <CardTitle className="text-2xl text-green-600">
                      {formatCurrency(fleetTCO?.costPerKm)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Breakdown by Vehicle */}
              <Card>
                <CardHeader>
                  <CardTitle>Desglose por Vehículo</CardTitle>
                  <CardDescription>
                    Costos operativos de cada unidad en el período seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fleetTCO?.vehicleBreakdown?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehículo</TableHead>
                          <TableHead>Combustible</TableHead>
                          <TableHead>Mantenimiento</TableHead>
                          <TableHead>TCO Total</TableHead>
                          <TableHead>Costo/km</TableHead>
                          <TableHead>km Recorridos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fleetTCO.vehicleBreakdown.map((item) => (
                          <TableRow key={item.vehicleId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.plate}</div>
                                <div className="text-sm text-gray-500">
                                  {item.brand} {item.model}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(item.fuelCost)}</TableCell>
                            <TableCell>{formatCurrency(item.maintenanceCost)}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.totalTCO)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{formatCurrency(item.costPerKm)}</Badge>
                            </TableCell>
                            <TableCell>{item.totalKm?.toLocaleString() || 0} km</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay datos disponibles para el período seleccionado
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Individual Vehicle TCO Tab */}
        <TabsContent value="vehicle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Vehículo</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedVehicle && (
            <>
              {isLoadingVehicle ? (
                <div className="text-center py-8">Cargando datos...</div>
              ) : vehicleTCO ? (
                <>
                  {/* Vehicle Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>TCO Total</CardDescription>
                        <CardTitle className="text-3xl">
                          {formatCurrency(vehicleTCO.totalTCO)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Costo por Kilómetro</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                          {formatCurrency(vehicleTCO.costPerKm)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Kilómetros Recorridos</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">
                          {vehicleTCO.totalKm?.toLocaleString() || 0} km
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Cost Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Desglose de Costos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Fuel className="h-5 w-5 text-amber-600" />
                            <div>
                              <div className="font-medium">Combustible</div>
                              <div className="text-sm text-gray-500">
                                {vehicleTCO.fuelDetails?.totalLiters?.toFixed(2) || 0} litros
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-600">
                              {formatCurrency(vehicleTCO.fuelCost)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {((vehicleTCO.fuelCost / vehicleTCO.totalTCO) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Wrench className="h-5 w-5 text-purple-600" />
                            <div>
                              <div className="font-medium">Mantenimiento</div>
                              <div className="text-sm text-gray-500">
                                {vehicleTCO.maintenanceDetails?.totalServices || 0} servicios
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(vehicleTCO.maintenanceCost)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {((vehicleTCO.maintenanceCost / vehicleTCO.totalTCO) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos disponibles para este vehículo
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Compare Vehicles Tab */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Vehículos a Comparar</CardTitle>
              <CardDescription>Seleccione de 2 a 5 vehículos para comparar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  onValueChange={handleAddToCompare}
                  disabled={compareVehicles.length >= 5}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Agregar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter((v) => !compareVehicles.includes(v.id))
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {compareVehicles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {compareVehicles.map((vehicleId) => {
                      const vehicle = vehicles.find((v) => v.id === vehicleId);
                      return (
                        <Badge key={vehicleId} variant="secondary" className="px-3 py-1">
                          {vehicle?.plate}
                          <button
                            onClick={() => handleRemoveFromCompare(vehicleId)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {compareVehicles.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Costos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingComparison ? (
                  <div className="text-center py-8">Cargando comparación...</div>
                ) : comparisonData?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehículo</TableHead>
                        <TableHead>TCO Total</TableHead>
                        <TableHead>Combustible</TableHead>
                        <TableHead>Mantenimiento</TableHead>
                        <TableHead>Costo/km</TableHead>
                        <TableHead>km Recorridos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonData.map((item) => (
                        <TableRow key={item.vehicleId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.plate}</div>
                              <div className="text-sm text-gray-500">
                                {item.brand} {item.model}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.totalTCO)}
                          </TableCell>
                          <TableCell>{formatCurrency(item.fuelCost)}</TableCell>
                          <TableCell>{formatCurrency(item.maintenanceCost)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatCurrency(item.costPerKm)}</Badge>
                          </TableCell>
                          <TableCell>{item.totalKm?.toLocaleString() || 0} km</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos disponibles para la comparación
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
