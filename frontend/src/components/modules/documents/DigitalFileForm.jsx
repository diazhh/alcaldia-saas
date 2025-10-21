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

const schema = z.object({
  subject: z.string().min(1, 'El asunto es requerido'),
  type: z.string().min(1, 'El tipo es requerido'),
  description: z.string().optional(),
  responsibleUserId: z.string().min(1, 'El responsable es requerido'),
  openingDate: z.string().min(1, 'La fecha es requerida'),
});

export function DigitalFileForm({ file, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: file || {
      openingDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/api/admin/users');
      return response.data;
    },
  });

  useEffect(() => {
    if (file) {
      Object.keys(file).forEach((key) => {
        if (key === 'openingDate') {
          setValue(key, new Date(file[key]).toISOString().split('T')[0]);
        } else if (key === 'responsibleUserId' && file.responsibleUser) {
          setValue(key, file.responsibleUser.id);
        } else {
          setValue(key, file[key]);
        }
      });
    }
  }, [file, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (file) {
        await api.put(`/api/documents/files/${file.id}`, data);
        toast.success('Expediente actualizado exitosamente');
      } else {
        await api.post('/api/documents/files', data);
        toast.success('Expediente creado exitosamente');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el expediente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {file ? 'Editar' : 'Nuevo'} Expediente Digital
          </DialogTitle>
          <DialogDescription>
            Complete los datos del expediente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Asunto del expediente"
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Input
              id="type"
              {...register('type')}
              placeholder="Ej: Administrativo, Legal, Técnico"
            />
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del expediente"
              rows={4}
            />
          </div>

          {/* Responsible User */}
          <div className="space-y-2">
            <Label htmlFor="responsibleUserId">Responsable *</Label>
            <Select
              onValueChange={(value) => setValue('responsibleUserId', value)}
              defaultValue={watch('responsibleUserId')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el responsable" />
              </SelectTrigger>
              <SelectContent>
                {users?.data?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.responsibleUserId && (
              <p className="text-sm text-red-600">{errors.responsibleUserId.message}</p>
            )}
          </div>

          {/* Opening Date */}
          <div className="space-y-2">
            <Label htmlFor="openingDate">Fecha de Apertura *</Label>
            <Input
              id="openingDate"
              type="date"
              {...register('openingDate')}
            />
            {errors.openingDate && (
              <p className="text-sm text-red-600">{errors.openingDate.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : file ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
