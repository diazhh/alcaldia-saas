'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreateSavingsBankAccount } from '@/hooks/hr/useSavingsBank';
import EmployeeSelector from './EmployeeSelector';
import { Loader2 } from 'lucide-react';

const savingsAccountSchema = z.object({
  employeeId: z.string().min(1, 'Debe seleccionar un empleado'),
  employeeRate: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100'),
  employerRate: z.coerce.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Debe ser menor o igual a 100'),
});

/**
 * Diálogo para crear cuenta de caja de ahorro
 */
export default function CreateSavingsBankAccountDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const createAccount = useCreateSavingsBankAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(savingsAccountSchema),
    defaultValues: {
      employeeId: '',
      employeeRate: 5.0,
      employerRate: 5.0,
    },
  });

  const employeeId = watch('employeeId');

  const onSubmit = async (data) => {
    try {
      await createAccount.mutateAsync(data);
      toast({
        title: 'Cuenta creada',
        description: 'La cuenta de ahorro se ha creado exitosamente.',
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear la cuenta de ahorro.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Cuenta de Ahorro</DialogTitle>
          <DialogDescription>
            Crear una nueva cuenta de caja de ahorro para un empleado
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
              <Label htmlFor="employeeRate">Tasa Empleado (%) *</Label>
              <Input
                id="employeeRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('employeeRate')}
              />
              {errors.employeeRate && (
                <p className="text-xs text-destructive">{errors.employeeRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employerRate">Tasa Patronal (%) *</Label>
              <Input
                id="employerRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('employerRate')}
              />
              {errors.employerRate && (
                <p className="text-xs text-destructive">{errors.employerRate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={createAccount.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
