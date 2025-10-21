/**
 * Diálogo para crear una nueva transacción (compromiso)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTransaction, useBudgetItems, useBudgetByYear } from '@/hooks/useFinance';
import { Loader2 } from 'lucide-react';

const transactionSchema = z.object({
  budgetItemId: z.string().min(1, 'Debe seleccionar una partida'),
  concept: z.string().min(1, 'El concepto es requerido'),
  amount: z.number().positive('El monto debe ser positivo'),
  beneficiary: z.string().min(1, 'El beneficiario es requerido'),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  contractNumber: z.string().optional(),
  purchaseOrder: z.string().optional(),
});

export function CreateTransactionDialog({ children }) {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const { data: budget } = useBudgetByYear(currentYear);
  const { data: budgetItems } = useBudgetItems(budget?.id);
  const createTransaction = useCreateTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(transactionSchema),
  });

  const selectedBudgetItemId = watch('budgetItemId');
  const selectedItem = budgetItems?.find(item => item.id === selectedBudgetItemId);

  const onSubmit = async (data) => {
    try {
      await createTransaction.mutateAsync({
        ...data,
        amount: parseFloat(data.amount),
        type: 'GASTO',
      });
      setOpen(false);
      reset();
    } catch (error) {
      console.error('Error al crear compromiso:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Compromiso</DialogTitle>
          <DialogDescription>
            Registre un compromiso presupuestario para reservar fondos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budgetItemId">Partida Presupuestaria *</Label>
            <Select
              onValueChange={(value) => setValue('budgetItemId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una partida" />
              </SelectTrigger>
              <SelectContent>
                {budgetItems?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} - {item.name} (Disponible: {parseFloat(item.availableAmount).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budgetItemId && (
              <p className="text-sm text-red-500">{errors.budgetItemId.message}</p>
            )}
            {selectedItem && (
              <p className="text-sm text-muted-foreground">
                Disponible: {parseFloat(selectedItem.availableAmount).toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">Concepto del Gasto *</Label>
            <Input
              id="concept"
              placeholder="Ej: Compra de equipos de oficina"
              {...register('concept')}
            />
            {errors.concept && (
              <p className="text-sm text-red-500">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiario/Proveedor *</Label>
            <Input
              id="beneficiary"
              placeholder="Nombre del proveedor o beneficiario"
              {...register('beneficiary')}
            />
            {errors.beneficiary && (
              <p className="text-sm text-red-500">{errors.beneficiary.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Nº de Factura</Label>
              <Input
                id="invoiceNumber"
                placeholder="000001"
                {...register('invoiceNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractNumber">Nº de Contrato</Label>
              <Input
                id="contractNumber"
                placeholder="CONT-2025-001"
                {...register('contractNumber')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseOrder">Orden de Compra</Label>
            <Input
              id="purchaseOrder"
              placeholder="OC-2025-001"
              {...register('purchaseOrder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales del gasto..."
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
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar Compromiso
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
