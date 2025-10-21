/**
 * Diálogo para registrar un nuevo ingreso
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
import { useCreateIncome, useBankAccounts } from '@/hooks/useFinance';
import { Loader2 } from 'lucide-react';

const incomeSchema = z.object({
  bankAccountId: z.string().min(1, 'Debe seleccionar una cuenta'),
  type: z.enum(['SITUADO', 'TRIBUTOS', 'TRANSFERENCIA', 'MULTAS', 'TASAS', 'OTROS']),
  amount: z.number().positive('El monto debe ser positivo'),
  concept: z.string().min(1, 'El concepto es requerido'),
  source: z.string().min(1, 'La fuente es requerida'),
  description: z.string().optional(),
  incomeDate: z.string().min(1, 'La fecha es requerida'),
});

const INCOME_TYPES = {
  SITUADO: 'Situado Constitucional',
  TRIBUTOS: 'Tributos Municipales',
  TRANSFERENCIA: 'Transferencias',
  MULTAS: 'Multas y Sanciones',
  TASAS: 'Tasas por Servicios',
  OTROS: 'Otros Ingresos',
};

export function CreateIncomeDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { data: bankAccounts } = useBankAccounts();
  const createIncome = useCreateIncome();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      incomeDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data) => {
    try {
      await createIncome.mutateAsync({
        ...data,
        amount: parseFloat(data.amount),
      });
      setOpen(false);
      reset();
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
          <DialogDescription>
            Registre un ingreso recibido en las cuentas del municipio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankAccountId">Cuenta Bancaria *</Label>
            <Select
              onValueChange={(value) => setValue('bankAccountId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una cuenta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankAccountId && (
              <p className="text-sm text-red-500">{errors.bankAccountId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Ingreso *</Label>
            <Select
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INCOME_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
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
            <Label htmlFor="concept">Concepto *</Label>
            <Input
              id="concept"
              placeholder="Ej: Situado del mes de enero"
              {...register('concept')}
            />
            {errors.concept && (
              <p className="text-sm text-red-500">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Fuente del Ingreso *</Label>
            <Input
              id="source"
              placeholder="Ej: Gobierno Nacional, Contribuyentes"
              {...register('source')}
            />
            {errors.source && (
              <p className="text-sm text-red-500">{errors.source.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeDate">Fecha del Ingreso *</Label>
            <Input
              id="incomeDate"
              type="date"
              {...register('incomeDate')}
            />
            {errors.incomeDate && (
              <p className="text-sm text-red-500">{errors.incomeDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales del ingreso..."
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
            <Button type="submit" disabled={createIncome.isPending}>
              {createIncome.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar Ingreso
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
