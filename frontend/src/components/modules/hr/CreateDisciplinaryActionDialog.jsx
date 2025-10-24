'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateDisciplinaryAction } from '@/hooks/hr/useDisciplinary';
import EmployeeSelector from './EmployeeSelector';
import { Loader2 } from 'lucide-react';

const disciplinaryActionSchema = z.object({
  employeeId: z.string().min(1, 'Debe seleccionar un empleado'),
  type: z.enum(['VERBAL_WARNING', 'WRITTEN_WARNING', 'SUSPENSION', 'TERMINATION', 'FINE'], {
    required_error: 'Debe seleccionar un tipo de acción',
  }),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    required_error: 'Debe seleccionar una severidad',
  }),
  reason: z.string().min(5, 'La razón debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  evidence: z.string().optional(),
  witnesses: z.string().optional(),
});

/**
 * Diálogo para crear acción disciplinaria
 */
export default function CreateDisciplinaryActionDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const createAction = useCreateDisciplinaryAction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(disciplinaryActionSchema),
    defaultValues: {
      employeeId: '',
      type: '',
      severity: '',
      reason: '',
      description: '',
      evidence: '',
      witnesses: '',
    },
  });

  const employeeId = watch('employeeId');

  const onSubmit = async (data) => {
    try {
      await createAction.mutateAsync(data);
      toast({
        title: 'Acción disciplinaria iniciada',
        description: 'La acción disciplinaria se ha registrado exitosamente.',
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo iniciar la acción disciplinaria.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Acción Disciplinaria</DialogTitle>
          <DialogDescription>
            Iniciar un proceso disciplinario según el debido proceso
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado *</Label>
            <EmployeeSelector
              value={employeeId}
              onValueChange={(value) => setValue('employeeId', value)}
              placeholder="Seleccionar empleado..."
              status="ACTIVE"
            />
            {errors.employeeId && (
              <p className="text-xs text-destructive">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Acción *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VERBAL_WARNING">Amonestación Verbal</SelectItem>
                      <SelectItem value="WRITTEN_WARNING">Amonestación Escrita</SelectItem>
                      <SelectItem value="SUSPENSION">Suspensión</SelectItem>
                      <SelectItem value="TERMINATION">Destitución</SelectItem>
                      <SelectItem value="FINE">Multa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severidad *</Label>
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar severidad..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="CRITICAL">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.severity && (
                <p className="text-xs text-destructive">{errors.severity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón *</Label>
            <Input
              id="reason"
              placeholder="Razón de la acción disciplinaria"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Detallada *</Label>
            <Textarea
              id="description"
              placeholder="Describa los hechos que motivan la acción disciplinaria..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidencias (Opcional)</Label>
            <Textarea
              id="evidence"
              placeholder="Describa las evidencias disponibles..."
              rows={2}
              {...register('evidence')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="witnesses">Testigos (Opcional)</Label>
            <Input
              id="witnesses"
              placeholder="Nombres de testigos separados por coma"
              {...register('witnesses')}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-900">Proceso de Debido Proceso</p>
            <ol className="text-xs text-blue-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Iniciación de la acción disciplinaria</li>
              <li>Notificación al empleado</li>
              <li>Plazo para descargos (5-10 días hábiles)</li>
              <li>Evaluación de la respuesta</li>
              <li>Toma de decisión</li>
              <li>Posibilidad de apelación</li>
            </ol>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={createAction.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAction.isPending}>
              {createAction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Acción Disciplinaria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
