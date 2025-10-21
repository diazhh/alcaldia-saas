'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createVehicle, updateVehicle } from '@/services/fleet.service';

export default function VehicleDialog({ open, onClose, vehicle }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'SEDAN',
    fuelType: 'GASOLINE',
    color: '',
    vin: '',
    engineNumber: '',
    capacity: 5,
    acquisitionDate: '',
    acquisitionValue: 0,
    currentValue: 0,
    currentMileage: 0,
    status: 'OPERATIONAL',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        code: vehicle.code || '',
        plate: vehicle.plate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        type: vehicle.type || 'SEDAN',
        fuelType: vehicle.fuelType || 'GASOLINE',
        color: vehicle.color || '',
        vin: vehicle.vin || '',
        engineNumber: vehicle.engineNumber || '',
        capacity: vehicle.capacity || 5,
        acquisitionDate: vehicle.acquisitionDate
          ? new Date(vehicle.acquisitionDate).toISOString().split('T')[0]
          : '',
        acquisitionValue: vehicle.acquisitionValue || 0,
        currentValue: vehicle.currentValue || 0,
        currentMileage: vehicle.currentMileage || 0,
        status: vehicle.status || 'OPERATIONAL',
      });
    } else {
      setFormData({
        code: '',
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        type: 'SEDAN',
        fuelType: 'GASOLINE',
        color: '',
        vin: '',
        engineNumber: '',
        capacity: 5,
        acquisitionDate: '',
        acquisitionValue: 0,
        currentValue: 0,
        currentMileage: 0,
        status: 'OPERATIONAL',
      });
    }
  }, [vehicle, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        year: parseInt(formData.year),
        capacity: parseInt(formData.capacity),
        acquisitionValue: parseFloat(formData.acquisitionValue),
        currentValue: parseFloat(formData.currentValue),
        currentMileage: parseInt(formData.currentMileage),
      };

      if (vehicle) {
        await updateVehicle(vehicle.id, data);
        toast.success('Vehículo actualizado exitosamente');
      } else {
        await createVehicle(data);
        toast.success('Vehículo creado exitosamente');
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(error.response?.data?.message || 'Error al guardar vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehicle
              ? 'Actualiza la información del vehículo'
              : 'Registra un nuevo vehículo en la flota'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificación */}
          <div className="space-y-4">
            <h3 className="font-medium">Identificación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  required
                  placeholder="VEH-001"
                />
              </div>
              <div>
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => handleChange('plate', e.target.value)}
                  required
                  placeholder="ABC-123"
                />
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="space-y-4">
            <h3 className="font-medium">Información del Vehículo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  required
                  placeholder="Toyota"
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  required
                  placeholder="Hilux"
                />
              </div>
              <div>
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  required
                  placeholder="Blanco"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEDAN">Sedán</SelectItem>
                    <SelectItem value="PICKUP">Pickup</SelectItem>
                    <SelectItem value="TRUCK">Camión</SelectItem>
                    <SelectItem value="VAN">Van</SelectItem>
                    <SelectItem value="BUS">Autobús</SelectItem>
                    <SelectItem value="MOTORCYCLE">Motocicleta</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fuelType">Tipo de Combustible *</Label>
                <Select value={formData.fuelType} onValueChange={(value) => handleChange('fuelType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GASOLINE">Gasolina</SelectItem>
                    <SelectItem value="DIESEL">Diésel</SelectItem>
                    <SelectItem value="ELECTRIC">Eléctrico</SelectItem>
                    <SelectItem value="HYBRID">Híbrido</SelectItem>
                    <SelectItem value="GAS">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacidad (personas) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATIONAL">Operativo</SelectItem>
                    <SelectItem value="IN_REPAIR">En Reparación</SelectItem>
                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Fuera de Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div className="space-y-4">
            <h3 className="font-medium">Información Técnica</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleChange('vin', e.target.value)}
                  placeholder="Número de identificación vehicular"
                />
              </div>
              <div>
                <Label htmlFor="engineNumber">Número de Motor</Label>
                <Input
                  id="engineNumber"
                  value={formData.engineNumber}
                  onChange={(e) => handleChange('engineNumber', e.target.value)}
                  placeholder="Número de motor"
                />
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="space-y-4">
            <h3 className="font-medium">Información Financiera</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acquisitionDate">Fecha de Adquisición *</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => handleChange('acquisitionDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currentMileage">Kilometraje Actual *</Label>
                <Input
                  id="currentMileage"
                  type="number"
                  value={formData.currentMileage}
                  onChange={(e) => handleChange('currentMileage', e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="acquisitionValue">Valor de Adquisición *</Label>
                <Input
                  id="acquisitionValue"
                  type="number"
                  value={formData.acquisitionValue}
                  onChange={(e) => handleChange('acquisitionValue', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="currentValue">Valor Actual *</Label>
                <Input
                  id="currentValue"
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => handleChange('currentValue', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : vehicle ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
