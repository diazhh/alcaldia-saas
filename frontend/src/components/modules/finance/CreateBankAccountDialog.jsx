/**
 * Diálogo para crear una nueva cuenta bancaria
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
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const bankAccountSchema = z.object({
  bankName: z.string().min(1, 'El nombre del banco es requerido'),
  accountNumber: z.string().min(1, 'El número de cuenta es requerido'),
  accountType: z.enum(['CORRIENTE', 'AHORRO', 'ESPECIAL']),
  currency: z.string().default('VES'),
  balance: z.number().default(0),
  description: z.string().optional(),
});

export function CreateBankAccountDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      currency: 'VES',
      balance: 0,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/finance/bank-accounts', {
        ...data,
        balance: parseFloat(data.balance),
      });
      
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Cuenta bancaria creada exitosamente');
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta Bancaria</DialogTitle>
          <DialogDescription>
            Registre una cuenta bancaria del municipio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nombre del Banco *</Label>
            <Input
              id="bankName"
              placeholder="Banco de Venezuela"
              {...register('bankName')}
            />
            {errors.bankName && (
              <p className="text-sm text-red-500">{errors.bankName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Número de Cuenta *</Label>
            <Input
              id="accountNumber"
              placeholder="0102-0000-00-0000000000"
              {...register('accountNumber')}
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Tipo de Cuenta *</Label>
            <Select
              onValueChange={(value) => setValue('accountType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CORRIENTE">Cuenta Corriente</SelectItem>
                <SelectItem value="AHORRO">Cuenta de Ahorro</SelectItem>
                <SelectItem value="ESPECIAL">Cuenta Especial</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-500">{errors.accountType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                defaultValue="VES"
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VES">VES (Bolívares)</SelectItem>
                  <SelectItem value="USD">USD (Dólares)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Saldo Inicial</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('balance', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Información adicional de la cuenta..."
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
              Crear Cuenta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
