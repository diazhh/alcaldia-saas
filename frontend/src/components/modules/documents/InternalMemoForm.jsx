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
  type: z.enum(['MEMO', 'OFFICE', 'CIRCULAR', 'PROVIDENCE'], {
    required_error: 'El tipo es requerido',
  }),
  subject: z.string().min(1, 'El asunto es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  originDepartmentId: z.string().min(1, 'El departamento origen es requerido'),
  destinationDepartmentId: z.string().min(1, 'El departamento destino es requerido'),
  issueDate: z.string().min(1, 'La fecha es requerida'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  attachmentUrl: z.string().optional(),
});

export function InternalMemoForm({ memo, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: memo || {
      issueDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      type: 'MEMO',
    },
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/api/departments');
      return response.data;
    },
  });

  useEffect(() => {
    if (memo) {
      Object.keys(memo).forEach((key) => {
        if (key === 'issueDate') {
          setValue(key, new Date(memo[key]).toISOString().split('T')[0]);
        } else if (key === 'originDepartmentId' && memo.originDepartment) {
          setValue(key, memo.originDepartment.id);
        } else if (key === 'destinationDepartmentId' && memo.destinationDepartment) {
          setValue(key, memo.destinationDepartment.id);
        } else {
          setValue(key, memo[key]);
        }
      });
    }
  }, [memo, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (memo) {
        await api.put(`/api/documents/memos/${memo.id}`, data);
        toast.success('Oficio actualizado exitosamente');
      } else {
        await api.post('/api/documents/memos', data);
        toast.success('Oficio creado exitosamente');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el oficio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {memo ? 'Editar' : 'Nuevo'} Oficio Interno
          </DialogTitle>
          <DialogDescription>
            Complete los datos del oficio o memorando interno
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              onValueChange={(value) => setValue('type', value)}
              defaultValue={watch('type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMO">Memorando</SelectItem>
                <SelectItem value="OFFICE">Oficio</SelectItem>
                <SelectItem value="CIRCULAR">Circular</SelectItem>
                <SelectItem value="PROVIDENCE">Providencia</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Asunto del oficio"
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Contenido del oficio"
              rows={6}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Origin Department */}
          <div className="space-y-2">
            <Label htmlFor="originDepartmentId">Departamento Origen *</Label>
            <Select
              onValueChange={(value) => setValue('originDepartmentId', value)}
              defaultValue={watch('originDepartmentId')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el departamento origen" />
              </SelectTrigger>
              <SelectContent>
                {departments?.data?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.originDepartmentId && (
              <p className="text-sm text-red-600">{errors.originDepartmentId.message}</p>
            )}
          </div>

          {/* Destination Department */}
          <div className="space-y-2">
            <Label htmlFor="destinationDepartmentId">Departamento Destino *</Label>
            <Select
              onValueChange={(value) => setValue('destinationDepartmentId', value)}
              defaultValue={watch('destinationDepartmentId')}
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
            {errors.destinationDepartmentId && (
              <p className="text-sm text-red-600">{errors.destinationDepartmentId.message}</p>
            )}
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="issueDate">Fecha de Emisión *</Label>
            <Input
              id="issueDate"
              type="date"
              {...register('issueDate')}
            />
            {errors.issueDate && (
              <p className="text-sm text-red-600">{errors.issueDate.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select
              onValueChange={(value) => setValue('priority', value)}
              defaultValue={watch('priority')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione la prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attachment URL */}
          <div className="space-y-2">
            <Label htmlFor="attachmentUrl">URL del Documento</Label>
            <Input
              id="attachmentUrl"
              {...register('attachmentUrl')}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500">
              URL del documento adjunto (si está disponible)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : memo ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
