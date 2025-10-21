/**
 * Diálogo para crear una nueva partida presupuestaria
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
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const budgetItemSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  allocatedAmount: z.number().positive('El monto debe ser positivo'),
  description: z.string().optional(),
  category: z.string().optional(),
});

export function CreateBudgetItemDialog({ budgetId, children }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(budgetItemSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/finance/budget-items', {
        ...data,
        budgetId,
        allocatedAmount: parseFloat(data.allocatedAmount),
        availableAmount: parseFloat(data.allocatedAmount),
      });
      
      queryClient.invalidateQueries({ queryKey: ['budget-items', budgetId] });
      toast.success('Partida presupuestaria creada exitosamente');
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear partida');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Partida Presupuestaria</DialogTitle>
          <DialogDescription>
            Ingrese los datos de la nueva partida según clasificador ONAPRE
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Partida *</Label>
            <Input
              id="code"
              placeholder="4.01.01.02"
              {...register('code')}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Denominación *</Label>
            <Input
              id="name"
              placeholder="Gastos de Personal"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocatedAmount">Monto Asignado *</Label>
            <Input
              id="allocatedAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('allocatedAmount', { valueAsNumber: true })}
            />
            {errors.allocatedAmount && (
              <p className="text-sm text-red-500">{errors.allocatedAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              placeholder="Gastos Corrientes, Inversión, etc."
              {...register('category')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la partida..."
              {...register('description')}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Crear Partida
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
