'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Fuel, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getFuelControls,
  createFuelControl,
  updateFuelControl,
  deleteFuelControl,
  getVehicles,
  getFuelStatistics,
} from '@/services/fleet.service';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FuelControlDialog from '@/components/modules/fleet/FuelControlDialog';
import { toast } from 'sonner';

export default function FuelControlPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFuelControl, setSelectedFuelControl] = useState(null);
  const queryClient = useQueryClient();

  // Fetch fuel controls
  const { data: fuelControlsData, isLoading } = useQuery({
    queryKey: ['fuelControls', selectedVehicle],
    queryFn: () =>
      getFuelControls({
        vehicleId: selectedVehicle !== 'all' ? selectedVehicle : undefined,
      }),
  });

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ status: 'ACTIVE' }),
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['fuelStatistics'],
    queryFn: getFuelStatistics,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFuelControl,
    onSuccess: () => {
      queryClient.invalidateQueries(['fuelControls']);
      queryClient.invalidateQueries(['fuelStatistics']);
      toast.success('Registro de combustible creado exitosamente');
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear el registro');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFuelControl(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fuelControls']);
      queryClient.invalidateQueries(['fuelStatistics']);
      toast.success('Registro actualizado exitosamente');
      setDialogOpen(false);
      setSelectedFuelControl(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el registro');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFuelControl,
    onSuccess: () => {
      queryClient.invalidateQueries(['fuelControls']);
      queryClient.invalidateQueries(['fuelStatistics']);
      toast.success('Registro eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el registro');
    },
  });

  const handleSubmit = async (data) => {
    if (selectedFuelControl) {
      await updateMutation.mutateAsync({ id: selectedFuelControl.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (fuelControl) => {
    setSelectedFuelControl(fuelControl);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const fuelControls = fuelControlsData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const filteredFuelControls = fuelControls.filter((fc) => {
    const matchesSearch =
      fc.vehicle?.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fc.vehicle?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fc.station?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getFuelTypeLabel = (type) => {
    const types = {
      GASOLINE: 'Gasolina',
      DIESEL: 'Diesel',
      GAS: 'Gas',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Control de Combustible</h1>
          <p className="text-gray-600 mt-1">Gestión de cargas y análisis de rendimiento</p>
        </div>
        <Button onClick={() => { setSelectedFuelControl(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Carga
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Total Litros (Mes)
            </CardDescription>
            <CardTitle className="text-2xl">
              {statistics?.totalLitersThisMonth?.toFixed(2) || '0.00'} L
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gasto Total (Mes)
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">
              ${statistics?.totalCostThisMonth?.toFixed(2) || '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rendimiento Promedio
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {statistics?.averageEfficiency?.toFixed(2) || '0.00'} km/L
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cargas este Mes
            </CardDescription>
            <CardTitle className="text-2xl">
              {statistics?.totalLoadsThisMonth || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Combustible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por placa, marca o estación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : filteredFuelControls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron registros de combustible
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Costo/L</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Odómetro</TableHead>
                  <TableHead>Estación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuelControls.map((fc) => (
                  <TableRow key={fc.id}>
                    <TableCell>
                      {format(new Date(fc.date), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fc.vehicle?.plate}</div>
                        <div className="text-sm text-gray-500">
                          {fc.vehicle?.brand} {fc.vehicle?.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getFuelTypeLabel(fc.fuelType)}</Badge>
                    </TableCell>
                    <TableCell>{fc.liters.toFixed(2)} L</TableCell>
                    <TableCell>${fc.costPerLiter.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">${fc.totalCost.toFixed(2)}</TableCell>
                    <TableCell>{fc.odometer.toLocaleString()} km</TableCell>
                    <TableCell>{fc.station || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fc)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <FuelControlDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fuelControl={selectedFuelControl}
        vehicles={vehicles}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
