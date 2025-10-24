/**
 * Diálogo para crear modificaciones presupuestarias
 * Soporta: Créditos adicionales, Traspasos, Rectificaciones, Reducciones
 */

'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useBudgetItems } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';

const modificationSchema = z.object({
  type: z.enum(['CREDITO_ADICIONAL', 'TRASPASO', 'RECTIFICACION', 'REDUCCION']),
  reference: z.string().min(1, 'La referencia es requerida'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  amount: z.number().positive('El monto debe ser positivo'),
  justification: z.string().min(20, 'La justificación debe tener al menos 20 caracteres'),
  fromBudgetItemId: z.string().optional(),
  toBudgetItemId: z.string().optional(),
});

const MODIFICATION_TYPES = {
  CREDITO_ADICIONAL: {
    label: 'Crédito Adicional',
    description: 'Aumenta el presupuesto total y una partida específica',
    requiresFrom: false,
    requiresTo: true,
  },
  TRASPASO: {
    label: 'Traspaso',
    description: 'Transfiere recursos entre partidas sin cambiar el total',
    requiresFrom: true,
    requiresTo: true,
  },
  RECTIFICACION: {
    label: 'Rectificación',
    description: 'Corrige errores en el presupuesto',
    requiresFrom: false,
    requiresTo: false,
  },
  REDUCCION: {
    label: 'Reducción',
    description: 'Reduce el presupuesto total y una partida específica',
    requiresFrom: true,
    requiresTo: false,
  },
};

export function BudgetModificationDialog({ budgetId, children }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const queryClient = useQueryClient();

  const { data: budgetItems } = useBudgetItems(budgetId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(modificationSchema),
  });

  const fromBudgetItemId = watch('fromBudgetItemId');
  const toBudgetItemId = watch('toBudgetItemId');
  const amount = watch('amount');

  const selectedFromItem = budgetItems?.find(item => item.id === fromBudgetItemId);
  const selectedToItem = budgetItems?.find(item => item.id === toBudgetItemId);

  const typeConfig = MODIFICATION_TYPES[selectedType];

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedType('');
    }
  }, [open, reset]);

  const onSubmit = async (data) => {
    // Validar según tipo de modificación
    if (typeConfig?.requiresFrom && !data.fromBudgetItemId) {
      toast.error('Debe seleccionar una partida origen');
      return;
    }
    if (typeConfig?.requiresTo && !data.toBudgetItemId) {
      toast.error('Debe seleccionar una partida destino');
      return;
    }

    // Validar disponibilidad para traspasos y reducciones
    if ((data.type === 'TRASPASO' || data.type === 'REDUCCION') && selectedFromItem) {
      if (parseFloat(selectedFromItem.availableAmount) < data.amount) {
        toast.error('La partida origen no tiene suficiente disponibilidad');
        return;
      }
    }

    setIsLoading(true);
    try {
      await api.post('/finance/budget-modifications', {
        ...data,
        budgetId,
        amount: parseFloat(data.amount),
      });

      queryClient.invalidateQueries({ queryKey: ['budget-modifications', budgetId] });
      queryClient.invalidateQueries({ queryKey: ['budget-items', budgetId] });
      toast.success('Modificación presupuestaria creada exitosamente');
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear modificación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Modificación Presupuestaria</DialogTitle>
          <DialogDescription>
            Cree una modificación al presupuesto aprobado. Requiere aprobación posterior.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo de Modificación */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Modificación *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value);
                setValue('type', value);
                setValue('fromBudgetItemId', '');
                setValue('toBudgetItemId', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODIFICATION_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {selectedType && (
            <>
              {/* Referencia */}
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia *</Label>
                <Input
                  id="reference"
                  placeholder="MOD-2025-001"
                  {...register('reference')}
                />
                {errors.reference && (
                  <p className="text-sm text-red-500">{errors.reference.message}</p>
                )}
              </div>

              {/* Monto */}
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

              {/* Partidas (según tipo) */}
              {(typeConfig?.requiresFrom || typeConfig?.requiresTo) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Partida Origen */}
                  {typeConfig?.requiresFrom && (
                    <div className="space-y-2">
                      <Label htmlFor="fromBudgetItemId">Partida Origen *</Label>
                      <Select
                        value={fromBudgetItemId || ''}
                        onValueChange={(value) => setValue('fromBudgetItemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione partida" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetItems?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.code} - {item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Disponible: {formatCurrency(item.availableAmount)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedFromItem && (
                        <div className="text-sm p-2 bg-muted rounded">
                          <div className="font-medium">{selectedFromItem.code}</div>
                          <div className="text-muted-foreground">{selectedFromItem.name}</div>
                          <div className="mt-1">
                            Disponible: <span className="font-medium">{formatCurrency(selectedFromItem.availableAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Flecha indicadora para traspasos */}
                  {typeConfig?.requiresFrom && typeConfig?.requiresTo && (
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Partida Destino */}
                  {typeConfig?.requiresTo && (
                    <div className="space-y-2">
                      <Label htmlFor="toBudgetItemId">Partida Destino *</Label>
                      <Select
                        value={toBudgetItemId || ''}
                        onValueChange={(value) => setValue('toBudgetItemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione partida" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetItems?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.code} - {item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Asignado: {formatCurrency(item.allocatedAmount)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedToItem && (
                        <div className="text-sm p-2 bg-muted rounded">
                          <div className="font-medium">{selectedToItem.code}</div>
                          <div className="text-muted-foreground">{selectedToItem.name}</div>
                          <div className="mt-1">
                            Asignado: <span className="font-medium">{formatCurrency(selectedToItem.allocatedAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Resumen del impacto */}
              {amount > 0 && (selectedFromItem || selectedToItem) && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Impacto de la Modificación:</h4>
                  {selectedFromItem && (
                    <div className="text-sm">
                      <span className="font-medium">{selectedFromItem.code}:</span>{' '}
                      {formatCurrency(selectedFromItem.availableAmount)} → {' '}
                      <span className="font-bold text-red-600">
                        {formatCurrency(parseFloat(selectedFromItem.availableAmount) - amount)}
                      </span>
                    </div>
                  )}
                  {selectedToItem && (
                    <div className="text-sm">
                      <span className="font-medium">{selectedToItem.code}:</span>{' '}
                      {formatCurrency(selectedToItem.allocatedAmount)} → {' '}
                      <span className="font-bold text-green-600">
                        {formatCurrency(parseFloat(selectedToItem.allocatedAmount) + amount)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describa brevemente la modificación..."
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Justificación */}
              <div className="space-y-2">
                <Label htmlFor="justification">Justificación *</Label>
                <Textarea
                  id="justification"
                  placeholder="Justifique la necesidad de esta modificación presupuestaria..."
                  rows={4}
                  {...register('justification')}
                />
                {errors.justification && (
                  <p className="text-sm text-red-500">{errors.justification.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !selectedType}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Crear Modificación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
