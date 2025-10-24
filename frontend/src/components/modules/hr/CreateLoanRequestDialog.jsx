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
import { useCreateLoanRequest } from '@/hooks/hr/useSavingsBank';
import EmployeeSelector from './EmployeeSelector';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

const loanRequestSchema = z.object({
  employeeId: z.string().min(1, 'Debe seleccionar un empleado'),
  type: z.enum(['PERSONAL', 'EMERGENCY', 'VEHICLE', 'HOUSING', 'EDUCATION', 'MEDICAL', 'OTHER'], {
    required_error: 'Debe seleccionar un tipo de préstamo',
  }),
  amount: z.coerce.number().min(1, 'El monto debe ser mayor a 0'),
  installments: z.coerce.number().min(1, 'Debe tener al menos 1 cuota').max(60, 'Máximo 60 cuotas'),
  interestRate: z.coerce.number().min(0, 'La tasa debe ser mayor o igual a 0').max(100, 'La tasa debe ser menor o igual a 100'),
  purpose: z.string().min(10, 'Debe describir el propósito (mínimo 10 caracteres)'),
});

/**
 * Diálogo para solicitar préstamo de caja de ahorro
 */
export default function CreateLoanRequestDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const createLoan = useCreateLoanRequest();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      employeeId: '',
      type: '',
      amount: 0,
      installments: 12,
      interestRate: 8.0,
      purpose: '',
    },
  });

  const employeeId = watch('employeeId');
  const amount = watch('amount');
  const installments = watch('installments');
  const interestRate = watch('interestRate');

  // Calcular cuota mensual usando fórmula de amortización
  const monthlyPayment = useMemo(() => {
    if (!amount || !installments || !interestRate) return 0;
    
    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate) / 100 / 12; // Tasa mensual
    const n = parseInt(installments);
    
    if (rate === 0) {
      return principal / n;
    }
    
    // Fórmula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const payment = principal * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    return payment;
  }, [amount, installments, interestRate]);

  const onSubmit = async (data) => {
    try {
      await createLoan.mutateAsync(data);
      toast({
        title: 'Préstamo solicitado',
        description: 'La solicitud de préstamo se ha enviado exitosamente.',
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo solicitar el préstamo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Solicitar Préstamo</DialogTitle>
          <DialogDescription>
            Solicitar un préstamo de la caja de ahorro
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

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Préstamo *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                    <SelectItem value="VEHICLE">Vehículo</SelectItem>
                    <SelectItem value="HOUSING">Vivienda</SelectItem>
                    <SelectItem value="EDUCATION">Educación</SelectItem>
                    <SelectItem value="MEDICAL">Médico</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (Bs.) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Número de Cuotas *</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                max="60"
                {...register('installments')}
              />
              {errors.installments && (
                <p className="text-xs text-destructive">{errors.installments.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Tasa de Interés (%) *</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('interestRate')}
            />
            {errors.interestRate && (
              <p className="text-xs text-destructive">{errors.interestRate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Propósito del Préstamo *</Label>
            <Textarea
              id="purpose"
              placeholder="Describa el propósito del préstamo..."
              rows={3}
              {...register('purpose')}
            />
            {errors.purpose && (
              <p className="text-xs text-destructive">{errors.purpose.message}</p>
            )}
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">Cuota Mensual Estimada:</p>
            <p className="text-2xl font-bold">
              Bs. {monthlyPayment > 0 ? monthlyPayment.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total a pagar: Bs. {(monthlyPayment * installments).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={createLoan.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createLoan.isPending}>
              {createLoan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar Préstamo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
