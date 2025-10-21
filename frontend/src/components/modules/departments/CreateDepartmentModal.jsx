'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import { useCreateDepartment, useDepartmentTree } from '@/hooks/useDepartments';
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
  code: z.string().min(2, 'El código debe tener al menos 2 caracteres').max(20),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  type: z.enum(['DIRECCION', 'COORDINACION', 'DEPARTAMENTO', 'UNIDAD', 'SECCION', 'OFICINA']),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  location: z.string().optional(),
  maxEmployees: z.number().int().positive().optional().nullable(),
});

/**
 * Modal para crear un nuevo departamento
 */
export default function CreateDepartmentModal({ open, onOpenChange }) {
  const { toast } = useToast();
  const createDepartment = useCreateDepartment();
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
    defaultValues: {
      code: '',
      name: '',
      type: 'DEPARTAMENTO',
      description: '',
      parentId: null,
      phone: '',
      email: '',
      location: '',
      maxEmployees: null,
    },
  });

  const selectedType = watch('type');

  // Aplanar el árbol de departamentos para el selector
  const flattenDepartments = (depts, level = 0) => {
    if (!Array.isArray(depts)) return [];
    let result = [];
    depts.forEach((dept) => {
      result.push({ ...dept, level });
      if (dept.children && dept.children.length > 0) {
        result = result.concat(flattenDepartments(dept.children, level + 1));
      }
    });
    return result;
  };

  const flatDepartments = departments ? flattenDepartments(Array.isArray(departments) ? departments : departments.data || []) : [];

  const onSubmit = async (data) => {
    try {
      // Limpiar campos vacíos
      const cleanData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        location: data.location || undefined,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
        maxEmployees: data.maxEmployees || undefined,
      };

      await createDepartment.mutateAsync(cleanData);
      
      toast({
        title: 'Departamento creado',
        description: `El departamento ${data.name} ha sido creado exitosamente.`,
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'No se pudo crear el departamento',
        variant: 'destructive',
      });
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Departamento</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo departamento en la estructura organizacional
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Ej: DIR-ADM"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo <span className="text-red-500">*</span>
              </Label>
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
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Dirección de Administración"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Departamento Padre */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Departamento Padre</Label>
            <Select
              value={watch('parentId') || 'none'}
              onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin departamento padre (raíz)" />
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
            <p className="text-xs text-muted-foreground">
              Selecciona el departamento padre en la jerarquía
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del departamento y sus funciones..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="Ej: 0212-1234567"
                {...register('phone')}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ej: admin@municipal.gob.ve"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación Física</Label>
            <Input
              id="location"
              placeholder="Ej: Edificio Principal, Piso 2, Oficina 201"
              {...register('location')}
            />
          </div>

          {/* Máximo de empleados */}
          <div className="space-y-2">
            <Label htmlFor="maxEmployees">Máximo de Empleados</Label>
            <Input
              id="maxEmployees"
              type="number"
              min="1"
              placeholder="Ej: 50"
              {...register('maxEmployees', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Límite de personal que puede ser asignado a este departamento
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createDepartment.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createDepartment.isPending}>
              {createDepartment.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Crear Departamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

CreateDepartmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
