/**
 * Diálogo para crear/editar registro de combustible
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const fuelControlSchema = z.object({
  vehicleId: z.string().min(1, 'Debe seleccionar un vehículo'),
  date: z.string().min(1, 'La fecha es requerida'),
  liters: z.number().positive('Los litros deben ser positivos'),
  costPerLiter: z.number().positive('El costo debe ser positivo'),
  totalCost: z.number().positive('El costo total debe ser positivo'),
  odometer: z.number().positive('El odómetro debe ser positivo'),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'GAS']),
  station: z.string().optional(),
  notes: z.string().optional(),
});

export default function FuelControlDialog({ open, onOpenChange, fuelControl, vehicles, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(fuelControlSchema),
    defaultValues: {
      fuelType: 'GASOLINE',
    },
  });

  const liters = watch('liters');
  const costPerLiter = watch('costPerLiter');

  useEffect(() => {
    if (liters && costPerLiter) {
      setValue('totalCost', parseFloat((liters * costPerLiter).toFixed(2)));
    }
  }, [liters, costPerLiter, setValue]);

  useEffect(() => {
    if (fuelControl) {
      reset({
        vehicleId: fuelControl.vehicleId,
        date: fuelControl.date?.split('T')[0] || '',
        liters: fuelControl.liters,
        costPerLiter: fuelControl.costPerLiter,
        totalCost: fuelControl.totalCost,
        odometer: fuelControl.odometer,
        fuelType: fuelControl.fuelType,
        station: fuelControl.station || '',
        notes: fuelControl.notes || '',
      });
    } else {
      reset({
        fuelType: 'GASOLINE',
      });
    }
  }, [fuelControl, reset]);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...data,
      liters: parseFloat(data.liters),
      costPerLiter: parseFloat(data.costPerLiter),
      totalCost: parseFloat(data.totalCost),
      odometer: parseFloat(data.odometer),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {fuelControl ? 'Editar Registro de Combustible' : 'Nuevo Registro de Combustible'}
          </DialogTitle>
          <DialogDescription>
            Registre la carga de combustible del vehículo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="vehicleId">Vehículo *</Label>
              <Select
                onValueChange={(value) => setValue('vehicleId', value)}
                defaultValue={fuelControl?.vehicleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && (
                <p className="text-sm text-red-500">{errors.vehicleId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Tipo de Combustible *</Label>
              <Select
                onValueChange={(value) => setValue('fuelType', value)}
                defaultValue={fuelControl?.fuelType || 'GASOLINE'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASOLINE">Gasolina</SelectItem>
                  <SelectItem value="DIESEL">Diesel</SelectItem>
                  <SelectItem value="GAS">Gas</SelectItem>
                </SelectContent>
              </Select>
              {errors.fuelType && (
                <p className="text-sm text-red-500">{errors.fuelType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="liters">Litros *</Label>
              <Input
                id="liters"
                type="number"
                step="0.01"
                {...register('liters', { valueAsNumber: true })}
              />
              {errors.liters && (
                <p className="text-sm text-red-500">{errors.liters.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPerLiter">Costo por Litro *</Label>
              <Input
                id="costPerLiter"
                type="number"
                step="0.01"
                {...register('costPerLiter', { valueAsNumber: true })}
              />
              {errors.costPerLiter && (
                <p className="text-sm text-red-500">{errors.costPerLiter.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCost">Costo Total *</Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                readOnly
                {...register('totalCost', { valueAsNumber: true })}
                className="bg-gray-50"
              />
              {errors.totalCost && (
                <p className="text-sm text-red-500">{errors.totalCost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometer">Odómetro (km) *</Label>
              <Input
                id="odometer"
                type="number"
                step="0.1"
                {...register('odometer', { valueAsNumber: true })}
              />
              {errors.odometer && (
                <p className="text-sm text-red-500">{errors.odometer.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="station">Estación de Servicio</Label>
              <Input id="station" {...register('station')} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {fuelControl ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
