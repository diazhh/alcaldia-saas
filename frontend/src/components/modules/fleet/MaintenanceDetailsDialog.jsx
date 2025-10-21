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
  Wrench,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { completeMaintenance, deleteMaintenance } from '@/services/fleet.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
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
import MaintenanceDialog from './MaintenanceDialog';

const completeSchema = z.object({
  actualCost: z.coerce
    .number({ required_error: 'Ingresa el costo real' })
    .positive('Debe ser un número positivo'),
  performedBy: z.string().min(1, 'Ingresa quién realizó el mantenimiento'),
  completionNotes: z.string().optional(),
});

/**
 * Dialog for viewing maintenance details and completing maintenances
 * @param {Object} props
 * @param {Object} props.maintenance - Maintenance to display
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog state changes
 */
export default function MaintenanceDetailsDialog({ maintenance, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      actualCost: maintenance?.cost || 0,
      performedBy: '',
      completionNotes: '',
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: ({ id, data }) => completeMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingMaintenances'] });
      toast.success('Mantenimiento completado exitosamente');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo completar el mantenimiento');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      toast.success('Mantenimiento eliminado exitosamente');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'No se pudo eliminar el mantenimiento');
    },
  });

  const onComplete = async (data) => {
    await completeMutation.mutateAsync({
      id: maintenance.id,
      data: {
        ...data,
        completedDate: new Date().toISOString(),
      },
    });
  };

  const onDelete = async () => {
    await deleteMutation.mutateAsync(maintenance.id);
  };

  const getStatusBadge = (status) => {
    const variants = {
      SCHEDULED: { variant: 'default', label: 'Programado', icon: Calendar },
      IN_PROGRESS: { variant: 'secondary', label: 'En Progreso', icon: Wrench },
      COMPLETED: { variant: 'success', label: 'Completado', icon: CheckCircle },
      CANCELLED: { variant: 'destructive', label: 'Cancelado', icon: XCircle },
      OVERDUE: { variant: 'destructive', label: 'Vencido', icon: XCircle },
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

  const getTypeBadge = (type) => {
    const variants = {
      PREVENTIVE: 'Preventivo',
      CORRECTIVE: 'Correctivo',
      INSPECTION: 'Inspección',
      TIRE_CHANGE: 'Cambio de Neumáticos',
      OIL_CHANGE: 'Cambio de Aceite',
      OTHER: 'Otro',
    };
    return <Badge variant="outline">{variants[type] || type}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detalles del Mantenimiento</DialogTitle>
              {getStatusBadge(maintenance.status)}
            </div>
            <DialogDescription>
              Información completa del mantenimiento
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
                  {maintenance.vehicle?.plate} - {maintenance.vehicle?.brand}{' '}
                  {maintenance.vehicle?.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  Año: {maintenance.vehicle?.year} | Tipo: {maintenance.vehicle?.type}
                </p>
              </div>
            </div>

            <Separator />

            {/* Maintenance Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Tipo de Mantenimiento</h3>
                {getTypeBadge(maintenance.type)}
              </div>

              {maintenance.scheduledDate && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha Programada
                  </h3>
                  <p className="text-sm">
                    {format(new Date(maintenance.scheduledDate), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}

              {maintenance.completedDate && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Finalización
                  </h3>
                  <p className="text-sm">
                    {format(new Date(maintenance.completedDate), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              )}

              {maintenance.scheduledKm && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Kilometraje Programado</h3>
                  <p className="text-sm">{maintenance.scheduledKm.toLocaleString()} km</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Description & Notes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción
                </h3>
                <p className="text-sm">{maintenance.description}</p>
              </div>

              {maintenance.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Notas</h3>
                  <p className="text-sm text-muted-foreground">{maintenance.notes}</p>
                </div>
              )}

              {maintenance.completionNotes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Notas de Finalización</h3>
                  <p className="text-sm text-muted-foreground">
                    {maintenance.completionNotes}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Cost Information */}
            <div className="grid gap-4 md:grid-cols-2">
              {maintenance.estimatedCost && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Costo Estimado
                  </h3>
                  <p className="text-lg font-bold">
                    Bs. {maintenance.estimatedCost.toLocaleString()}
                  </p>
                </div>
              )}

              {maintenance.cost && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Costo Real
                  </h3>
                  <p className="text-lg font-bold text-primary">
                    Bs. {maintenance.cost.toLocaleString()}
                  </p>
                </div>
              )}

              {maintenance.performedBy && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Realizado Por</h3>
                  <p className="text-sm">{maintenance.performedBy}</p>
                </div>
              )}
            </div>

            {/* Complete Form */}
            {showCompleteForm &&
              (maintenance.status === 'SCHEDULED' ||
                maintenance.status === 'IN_PROGRESS') && (
                <>
                  <Separator />
                  <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
                    <h3 className="text-sm font-semibold">Completar Mantenimiento</h3>

                    <div className="space-y-2">
                      <Label htmlFor="actualCost">Costo Real ($) *</Label>
                      <Input
                        id="actualCost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('actualCost', { valueAsNumber: true })}
                      />
                      {errors.actualCost && (
                        <p className="text-sm text-red-500">{errors.actualCost.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="performedBy">Realizado Por *</Label>
                      <Input
                        id="performedBy"
                        placeholder="Nombre del técnico o taller"
                        {...register('performedBy')}
                      />
                      {errors.performedBy && (
                        <p className="text-sm text-red-500">{errors.performedBy.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="completionNotes">Notas de Finalización</Label>
                      <Textarea
                        id="completionNotes"
                        placeholder="Detalles del trabajo realizado..."
                        className="resize-none"
                        rows={3}
                        {...register('completionNotes')}
                      />
                      {errors.completionNotes && (
                        <p className="text-sm text-red-500">{errors.completionNotes.message}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCompleteForm(false)}
                        disabled={completeMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={completeMutation.isPending}>
                        {completeMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Completar Mantenimiento
                      </Button>
                    </div>
                  </form>
                </>
              )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {(maintenance.status === 'SCHEDULED' ||
              maintenance.status === 'IN_PROGRESS') &&
              !showCompleteForm && (
                <>
                  <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                    Editar
                  </Button>
                  <Button onClick={() => setShowCompleteForm(true)}>
                    Completar Mantenimiento
                  </Button>
                </>
              )}
            {maintenance.status === 'SCHEDULED' && (
              <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>
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
              Esta acción no se puede deshacer. El mantenimiento será eliminado
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
        <MaintenanceDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          maintenance={maintenance}
        />
      )}
    </>
  );
}
