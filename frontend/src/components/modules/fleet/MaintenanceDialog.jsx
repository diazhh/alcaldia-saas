'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createMaintenance, updateMaintenance, getVehicles } from '@/services/fleet.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Selecciona un vehículo'),
  type: z.string().min(1, 'Selecciona el tipo de mantenimiento'),
  description: z.string().min(1, 'Ingresa una descripción'),
  scheduledDate: z.string().optional(),
  scheduledKm: z.coerce.number().positive().optional(),
  estimatedCost: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
});

/**
 * Dialog for creating and editing maintenances
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog state changes
 * @param {Object} props.maintenance - Maintenance to edit (optional)
 */
export default function MaintenanceDialog({ open, onOpenChange, maintenance = null }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicleId: '',
      type: '',
      description: '',
      scheduledDate: '',
      scheduledKm: '',
      estimatedCost: '',
      notes: '',
    },
  });

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', { limit: 1000 }],
    queryFn: () => getVehicles({ limit: 1000 }),
  });

  const vehicles = vehiclesData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingMaintenances'] });
      toast.success('Mantenimiento programado exitosamente');
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo programar el mantenimiento');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', maintenance?.id] });
      toast.success('Mantenimiento actualizado exitosamente');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo actualizar el mantenimiento');
    },
  });

  // Load maintenance data when editing
  useEffect(() => {
    if (maintenance && open) {
      reset({
        vehicleId: maintenance.vehicleId,
        type: maintenance.type,
        description: maintenance.description || '',
        scheduledDate: maintenance.scheduledDate ? maintenance.scheduledDate.split('T')[0] : '',
        scheduledKm: maintenance.scheduledKm || '',
        estimatedCost: maintenance.estimatedCost || '',
        notes: maintenance.notes || '',
      });
    } else if (!open) {
      reset({
        vehicleId: '',
        type: '',
        description: '',
        scheduledDate: '',
        scheduledKm: '',
        estimatedCost: '',
        notes: '',
      });
    }
  }, [maintenance, open, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: data.vehicleId,
        type: data.type,
        description: data.description,
        scheduledDate: data.scheduledDate || undefined,
        scheduledKm: data.scheduledKm ? parseFloat(data.scheduledKm) : undefined,
        estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
        notes: data.notes || undefined,
      };

      if (maintenance) {
        await updateMutation.mutateAsync({ id: maintenance.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {maintenance ? 'Editar Mantenimiento' : 'Programar Nuevo Mantenimiento'}
          </DialogTitle>
          <DialogDescription>
            {maintenance
              ? 'Actualiza la información del mantenimiento'
              : 'Completa los datos para programar un nuevo mantenimiento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Vehicle */}
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehículo *</Label>
              <Select
                onValueChange={(value) => setValue('vehicleId', value)}
                defaultValue={watch('vehicleId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
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

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                onValueChange={(value) => setValue('type', value)}
                defaultValue={watch('type')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                  <SelectItem value="CORRECTIVE">Correctivo</SelectItem>
                  <SelectItem value="INSPECTION">Inspección</SelectItem>
                  <SelectItem value="TIRE_CHANGE">Cambio de Neumáticos</SelectItem>
                  <SelectItem value="OIL_CHANGE">Cambio de Aceite</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              placeholder="Ej: Cambio de aceite y filtros"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Fecha Programada</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register('scheduledDate')}
              />
              <p className="text-xs text-gray-500">Fecha estimada del mantenimiento</p>
              {errors.scheduledDate && (
                <p className="text-sm text-red-500">{errors.scheduledDate.message}</p>
              )}
            </div>

            {/* Scheduled Km */}
            <div className="space-y-2">
              <Label htmlFor="scheduledKm">Kilometraje Programado</Label>
              <Input
                id="scheduledKm"
                type="number"
                placeholder="0"
                {...register('scheduledKm')}
              />
              <p className="text-xs text-gray-500">Km al que se debe realizar</p>
              {errors.scheduledKm && (
                <p className="text-sm text-red-500">{errors.scheduledKm.message}</p>
              )}
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Costo Estimado ($)</Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('estimatedCost')}
            />
            {errors.estimatedCost && (
              <p className="text-sm text-red-500">{errors.estimatedCost.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales..."
              className="resize-none"
              rows={3}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {maintenance ? 'Actualizar' : 'Programar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
