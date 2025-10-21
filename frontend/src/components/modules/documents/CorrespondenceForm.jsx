'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from 'sonner';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const incomingSchema = z.object({
  sender: z.string().min(1, 'El remitente es requerido'),
  senderAddress: z.string().optional(),
  subject: z.string().min(1, 'El asunto es requerido'),
  destinationId: z.string().min(1, 'El destino es requerido'),
  registrationDate: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

const outgoingSchema = z.object({
  recipient: z.string().min(1, 'El destinatario es requerido'),
  recipientAddress: z.string().min(1, 'La dirección es requerida'),
  subject: z.string().min(1, 'El asunto es requerido'),
  registrationDate: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export function CorrespondenceForm({ type, correspondence, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isIncoming = type === 'incoming';
  const schema = isIncoming ? incomingSchema : outgoingSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: correspondence || {
      registrationDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch departments for incoming correspondence
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/api/departments');
      return response.data;
    },
    enabled: isIncoming,
  });

  useEffect(() => {
    if (correspondence) {
      Object.keys(correspondence).forEach((key) => {
        if (key === 'registrationDate') {
          setValue(key, new Date(correspondence[key]).toISOString().split('T')[0]);
        } else if (key === 'destinationId' && correspondence.destination) {
          setValue(key, correspondence.destination.id);
        } else {
          setValue(key, correspondence[key]);
        }
      });
    }
  }, [correspondence, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const endpoint = isIncoming ? '/api/documents/correspondence/incoming' : '/api/documents/correspondence/outgoing';
      
      if (correspondence) {
        await api.put(`/api/documents/correspondence/${correspondence.id}`, data);
        toast.success('Correspondencia actualizada exitosamente');
      } else {
        await api.post(endpoint, data);
        toast.success('Correspondencia registrada exitosamente');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar la correspondencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {correspondence ? 'Editar' : 'Nueva'} Correspondencia {isIncoming ? 'Entrante' : 'Saliente'}
          </DialogTitle>
          <DialogDescription>
            Complete los datos de la correspondencia {isIncoming ? 'recibida' : 'a enviar'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Sender/Recipient */}
          <div className="space-y-2">
            <Label htmlFor={isIncoming ? 'sender' : 'recipient'}>
              {isIncoming ? 'Remitente' : 'Destinatario'} *
            </Label>
            <Input
              id={isIncoming ? 'sender' : 'recipient'}
              {...register(isIncoming ? 'sender' : 'recipient')}
              placeholder={isIncoming ? 'Nombre del remitente' : 'Nombre del destinatario'}
            />
            {errors[isIncoming ? 'sender' : 'recipient'] && (
              <p className="text-sm text-red-600">
                {errors[isIncoming ? 'sender' : 'recipient'].message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor={isIncoming ? 'senderAddress' : 'recipientAddress'}>
              {isIncoming ? 'Dirección del Remitente' : 'Dirección del Destinatario'} {!isIncoming && '*'}
            </Label>
            <Input
              id={isIncoming ? 'senderAddress' : 'recipientAddress'}
              {...register(isIncoming ? 'senderAddress' : 'recipientAddress')}
              placeholder="Dirección completa"
            />
            {errors[isIncoming ? 'senderAddress' : 'recipientAddress'] && (
              <p className="text-sm text-red-600">
                {errors[isIncoming ? 'senderAddress' : 'recipientAddress'].message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Asunto de la correspondencia"
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Destination (only for incoming) */}
          {isIncoming && (
            <div className="space-y-2">
              <Label htmlFor="destinationId">Destino *</Label>
              <Select
                onValueChange={(value) => setValue('destinationId', value)}
                defaultValue={watch('destinationId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el departamento destino" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.data?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.destinationId && (
                <p className="text-sm text-red-600">{errors.destinationId.message}</p>
              )}
            </div>
          )}

          {/* Registration Date */}
          <div className="space-y-2">
            <Label htmlFor="registrationDate">Fecha de Registro *</Label>
            <Input
              id="registrationDate"
              type="date"
              {...register('registrationDate')}
            />
            {errors.registrationDate && (
              <p className="text-sm text-red-600">{errors.registrationDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>

          {/* Attachment URL */}
          <div className="space-y-2">
            <Label htmlFor="attachmentUrl">URL del Documento Digitalizado</Label>
            <Input
              id="attachmentUrl"
              {...register('attachmentUrl')}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500">
              URL del documento escaneado (si está disponible)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : correspondence ? 'Actualizar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
