'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import { useUpdateDepartment, useDepartmentTree } from '@/hooks/useDepartments';
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
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

const departmentSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(3).max(100),
  type: z.enum(['DIRECCION', 'COORDINACION', 'DEPARTAMENTO', 'UNIDAD', 'SECCION', 'OFICINA']),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  location: z.string().optional(),
  maxEmployees: z.number().int().positive().optional().nullable(),
  isActive: z.boolean(),
});

export default function EditDepartmentModal({ open, onOpenChange, department }) {
  const { toast } = useToast();
  const updateDepartment = useUpdateDepartment();
  const { data: departments } = useDepartmentTree();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(departmentSchema),
  });

  // Cargar datos del departamento cuando se abre el modal
  useEffect(() => {
    if (department && open) {
      reset({
        code: department.code,
        name: department.name,
        type: department.type,
        description: department.description || '',
        parentId: department.parentId || null,
        phone: department.phone || '',
        email: department.email || '',
        location: department.location || '',
        maxEmployees: department.maxEmployees || null,
        isActive: department.isActive,
      });
    }
  }, [department, open, reset]);

  const selectedType = watch('type');
  const isActive = watch('isActive');

  const flattenDepartments = (depts, level = 0) => {
    let result = [];
    depts.forEach((dept) => {
      // No incluir el departamento actual ni sus descendientes
      if (dept.id !== department?.id) {
        result.push({ ...dept, level });
        if (dept.children && dept.children.length > 0) {
          result = result.concat(flattenDepartments(dept.children, level + 1));
        }
      }
    });
    return result;
  };

  const flatDepartments = departments ? flattenDepartments(departments) : [];

  const onSubmit = async (data) => {
    try {
      const cleanData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        location: data.location || undefined,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
        maxEmployees: data.maxEmployees || undefined,
      };

      await updateDepartment.mutateAsync({
        id: department.id,
        data: cleanData,
      });

      toast({
        title: 'Departamento actualizado',
        description: `El departamento ${data.name} ha sido actualizado exitosamente.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'No se pudo actualizar el departamento',
        variant: 'destructive',
      });
    }
  };

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Departamento</DialogTitle>
          <DialogDescription>
            Modifica la información del departamento {department.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" {...register('code')} />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIRECCION">Dirección</SelectItem>
                  <SelectItem value="COORDINACION">Coordinación</SelectItem>
                  <SelectItem value="DEPARTAMENTO">Departamento</SelectItem>
                  <SelectItem value="UNIDAD">Unidad</SelectItem>
                  <SelectItem value="SECCION">Sección</SelectItem>
                  <SelectItem value="OFICINA">Oficina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Departamento Padre</Label>
            <Select
              value={watch('parentId') || 'none'}
              onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin departamento padre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin departamento padre (raíz)</SelectItem>
                {flatDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {'  '.repeat(dept.level)}
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register('phone')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación Física</Label>
            <Input id="location" {...register('location')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxEmployees">Máximo de Empleados</Label>
            <Input
              id="maxEmployees"
              type="number"
              min="1"
              {...register('maxEmployees', { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Departamento activo
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateDepartment.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateDepartment.isPending}>
              {updateDepartment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EditDepartmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  department: PropTypes.object,
};
