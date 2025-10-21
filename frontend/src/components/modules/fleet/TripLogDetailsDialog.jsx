'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Car,
  User,
  MapPin,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { finalizeTripLog, deleteTripLog } from '@/services/fleet.service';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import TripLogDialog from './TripLogDialog';

const finalizeSchema = z.object({
  endKm: z.coerce
    .number({ required_error: 'Ingresa el kilometraje final' })
    .positive('Debe ser un número positivo'),
  endObservations: z.string().optional(),
});

/**
 * Dialog for viewing trip log details and finalizing trips
 * @param {Object} props
 * @param {Object} props.tripLog - Trip log to display
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog state changes
 */
export default function TripLogDetailsDialog({ tripLog, open, onOpenChange }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFinalizeForm, setShowFinalizeForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(finalizeSchema),
    defaultValues: {
      endKm: tripLog?.endKm || 0,
      endObservations: '',
    },
  });

  // Finalize mutation
  const finalizeMutation = useMutation({
    mutationFn: ({ id, data }) => finalizeTripLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripLogs'] });
      queryClient.invalidateQueries({ queryKey: ['tripStatistics'] });
      toast({
        title: 'Viaje finalizado',
        description: 'El viaje se ha finalizado exitosamente',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo finalizar el viaje',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTripLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripLogs'] });
      toast({
        title: 'Viaje eliminado',
        description: 'El viaje se ha eliminado exitosamente',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el viaje',
        variant: 'destructive',
      });
    },
  });

  const onFinalize = async (data) => {
    await finalizeMutation.mutateAsync({
      id: tripLog.id,
      data: {
        ...data,
        endDate: new Date().toISOString(),
      },
    });
  };

  const onDelete = async () => {
    await deleteMutation.mutateAsync(tripLog.id);
  };

  const getStatusBadge = (status) => {
    const variants = {
      IN_PROGRESS: { variant: 'default', label: 'En Progreso', icon: Calendar },
      COMPLETED: { variant: 'success', label: 'Completado', icon: CheckCircle },
      CANCELLED: { variant: 'destructive', label: 'Cancelado', icon: XCircle },
    };
    const config = variants[status] || { variant: 'secondary', label: status, icon: Calendar };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const distanceTraveled = tripLog?.endKm
    ? tripLog.endKm - tripLog.startKm
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detalles del Viaje</DialogTitle>
              {getStatusBadge(tripLog.status)}
            </div>
            <DialogDescription>
              Información completa del registro de viaje
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Vehicle Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehículo
              </h3>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">
                  {tripLog.vehicle?.plate} - {tripLog.vehicle?.brand}{' '}
                  {tripLog.vehicle?.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  Año: {tripLog.vehicle?.year} | Tipo: {tripLog.vehicle?.type}
                </p>
              </div>
            </div>

            {/* Driver Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Conductor
              </h3>
              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  {tripLog.driver?.firstName} {tripLog.driver?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tripLog.driver?.email}
                </p>
              </div>
            </div>

            <Separator />

            {/* Trip Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Inicio
                </h3>
                <p className="text-sm">
                  {format(new Date(tripLog.startDate), "d 'de' MMMM, yyyy HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>

              {tripLog.endDate && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Finalización
                  </h3>
                  <p className="text-sm">
                    {format(new Date(tripLog.endDate), "d 'de' MMMM, yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Kilometraje Inicial</h3>
                <p className="text-sm">{tripLog.startKm.toLocaleString()} km</p>
              </div>

              {tripLog.endKm && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Kilometraje Final</h3>
                  <p className="text-sm">{tripLog.endKm.toLocaleString()} km</p>
                </div>
              )}

              {distanceTraveled !== null && (
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-sm font-semibold">Distancia Recorrida</h3>
                  <p className="text-lg font-bold text-primary">
                    {distanceTraveled.toLocaleString()} km
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Destination & Purpose */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destino
                </h3>
                <p className="text-sm">{tripLog.destination}</p>
              </div>

              {tripLog.purpose && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Motivo del Viaje
                  </h3>
                  <p className="text-sm">{tripLog.purpose}</p>
                </div>
              )}

              {tripLog.observations && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Observaciones Iniciales</h3>
                  <p className="text-sm text-muted-foreground">{tripLog.observations}</p>
                </div>
              )}

              {tripLog.endObservations && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Observaciones Finales</h3>
                  <p className="text-sm text-muted-foreground">
                    {tripLog.endObservations}
                  </p>
                </div>
              )}
            </div>

            {/* Finalize Form */}
            {showFinalizeForm && tripLog.status === 'IN_PROGRESS' && (
              <>
                <Separator />
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onFinalize)} className="space-y-4">
                    <h3 className="text-sm font-semibold">Finalizar Viaje</h3>

                    <FormField
                      control={form.control}
                      name="endKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilometraje Final *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endObservations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones Finales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observaciones al finalizar el viaje..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFinalizeForm(false)}
                        disabled={finalizeMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={finalizeMutation.isPending}>
                        {finalizeMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Finalizar Viaje
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {tripLog.status === 'IN_PROGRESS' && !showFinalizeForm && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(true)}
                >
                  Editar
                </Button>
                <Button onClick={() => setShowFinalizeForm(true)}>
                  Finalizar Viaje
                </Button>
              </>
            )}
            {tripLog.status === 'IN_PROGRESS' && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
              >
                Eliminar
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro del viaje será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <TripLogDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          tripLog={tripLog}
        />
      )}
    </>
  );
}
