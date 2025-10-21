'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createTripLog,
  updateTripLog,
  getVehicles,
} from '@/services/fleet.service';
import { getUsers } from '@/services/users.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

const tripLogSchema = z.object({
  vehicleId: z.string().min(1, 'Selecciona un vehículo'),
  driverId: z.string().min(1, 'Selecciona un conductor'),
  startDate: z.date({ required_error: 'Selecciona la fecha de inicio' }),
  startKm: z.coerce
    .number({ required_error: 'Ingresa el kilometraje inicial' })
    .positive('Debe ser un número positivo'),
  destination: z.string().min(1, 'Ingresa el destino'),
  purpose: z.string().optional(),
  observations: z.string().optional(),
});

/**
 * Dialog for creating and editing trip logs
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog state changes
 * @param {Object} props.tripLog - Trip log to edit (optional)
 */
export default function TripLogDialog({ open, onOpenChange, tripLog = null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(tripLogSchema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      startDate: new Date(),
      startKm: 0,
      destination: '',
      purpose: '',
      observations: '',
    },
  });

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', { limit: 1000, status: 'ACTIVE' }],
    queryFn: () => getVehicles({ limit: 1000, status: 'ACTIVE' }),
  });

  // Fetch users (drivers)
  const { data: usersData } = useQuery({
    queryKey: ['users', { limit: 1000 }],
    queryFn: () => getUsers({ limit: 1000 }),
  });

  const vehicles = vehiclesData?.data || [];
  const users = usersData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTripLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripLogs'] });
      queryClient.invalidateQueries({ queryKey: ['tripStatistics'] });
      toast({
        title: 'Viaje registrado',
        description: 'El viaje se ha registrado exitosamente',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo registrar el viaje',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTripLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripLogs'] });
      queryClient.invalidateQueries({ queryKey: ['tripLog', tripLog?.id] });
      toast({
        title: 'Viaje actualizado',
        description: 'El viaje se ha actualizado exitosamente',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el viaje',
        variant: 'destructive',
      });
    },
  });

  // Load trip log data when editing
  useEffect(() => {
    if (tripLog && open) {
      form.reset({
        vehicleId: tripLog.vehicleId,
        driverId: tripLog.driverId,
        startDate: new Date(tripLog.startDate),
        startKm: tripLog.startKm,
        destination: tripLog.destination,
        purpose: tripLog.purpose || '',
        observations: tripLog.observations || '',
      });
    } else if (!open) {
      form.reset();
    }
  }, [tripLog, open, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        startDate: data.startDate.toISOString(),
      };

      if (tripLog) {
        await updateMutation.mutateAsync({ id: tripLog.id, data: payload });
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
            {tripLog ? 'Editar Viaje' : 'Registrar Nuevo Viaje'}
          </DialogTitle>
          <DialogDescription>
            {tripLog
              ? 'Actualiza la información del viaje'
              : 'Completa los datos para registrar un nuevo viaje'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Vehicle */}
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!tripLog}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Driver */}
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un conductor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} - {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: require('date-fns/locale/es') })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Km */}
              <FormField
                control={form.control}
                name="startKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje Inicial *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        disabled={!!tripLog}
                      />
                    </FormControl>
                    <FormDescription>Kilometraje al iniciar el viaje</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination */}
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Centro de la ciudad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del Viaje</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Reunión con proveedores"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observations */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones adicionales..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {tripLog ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
