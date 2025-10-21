/**
 * Diálogo para crear un nuevo presupuesto
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBudget } from '@/hooks/useFinance';
import { Loader2 } from 'lucide-react';

const budgetSchema = z.object({
  year: z.number().min(2020).max(2100),
  totalAmount: z.number().positive('El monto debe ser positivo'),
  estimatedIncome: z.number().positive('El ingreso estimado debe ser positivo'),
  incomeSource: z.string().optional(),
  notes: z.string().optional(),
});

export function CreateBudgetDialog({ children, onSuccess }) {
  const [open, setOpen] = useState(false);
  const createBudget = useCreateBudget();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      year: new Date().getFullYear(),
    },
  });

  const onSubmit = async (data) => {
    try {
      await createBudget.mutateAsync({
        ...data,
        year: parseInt(data.year),
        totalAmount: parseFloat(data.totalAmount),
        estimatedIncome: parseFloat(data.estimatedIncome),
      });
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
          <DialogDescription>
            Ingrese los datos del presupuesto anual del municipio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year">Año Fiscal *</Label>
            <Input
              id="year"
              type="number"
              {...register('year', { valueAsNumber: true })}
            />
            {errors.year && (
              <p className="text-sm text-red-500">{errors.year.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Monto Total del Presupuesto *</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('totalAmount', { valueAsNumber: true })}
            />
            {errors.totalAmount && (
              <p className="text-sm text-red-500">{errors.totalAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedIncome">Ingresos Estimados *</Label>
            <Input
              id="estimatedIncome"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('estimatedIncome', { valueAsNumber: true })}
            />
            {errors.estimatedIncome && (
              <p className="text-sm text-red-500">{errors.estimatedIncome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeSource">Fuentes de Ingreso</Label>
            <Textarea
              id="incomeSource"
              placeholder="Situado constitucional, tributos municipales, transferencias..."
              {...register('incomeSource')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createBudget.isPending}>
              {createBudget.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Crear Presupuesto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
