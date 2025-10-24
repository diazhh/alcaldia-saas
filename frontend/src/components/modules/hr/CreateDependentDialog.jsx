'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCreateDependent } from '@/hooks/hr/useDependents';
import EmployeeSelector from './EmployeeSelector';
import { Loader2 } from 'lucide-react';

const dependentSchema = z.object({
  employeeId: z.string().min(1, 'Debe seleccionar un empleado'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  idNumber: z.string().optional(),
  birthDate: z.string().min(1, 'Debe seleccionar una fecha de nacimiento'),
  relationship: z.enum(['CHILD', 'SPOUSE', 'PARENT', 'SIBLING'], {
    required_error: 'Debe seleccionar una relación',
  }),
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Debe seleccionar un género',
  }),
  receivesHealthInsurance: z.boolean().default(false),
  receivesSchoolSupplies: z.boolean().default(false),
  receivesToys: z.boolean().default(false),
  receivesChildBonus: z.boolean().default(false),
});

/**
 * Diálogo para crear dependiente
 */
export default function CreateDependentDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const createDependent = useCreateDependent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(dependentSchema),
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      idNumber: '',
      birthDate: '',
      relationship: '',
      gender: '',
      receivesHealthInsurance: false,
      receivesSchoolSupplies: false,
      receivesToys: false,
      receivesChildBonus: false,
    },
  });

  const employeeId = watch('employeeId');

  const onSubmit = async (data) => {
    try {
      await createDependent.mutateAsync(data);
      toast({
        title: 'Dependiente agregado',
        description: 'El dependiente se ha registrado exitosamente.',
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo agregar el dependiente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Dependiente</DialogTitle>
          <DialogDescription>
            Registrar un nuevo dependiente o beneficiario
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado *</Label>
            <EmployeeSelector
              value={employeeId}
              onValueChange={(value) => setValue('employeeId', value)}
              placeholder="Seleccionar empleado..."
              status="ACTIVE"
            />
            {errors.employeeId && (
              <p className="text-xs text-destructive">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                placeholder="Nombre del dependiente"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                placeholder="Apellido del dependiente"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idNumber">Cédula (Opcional)</Label>
              <Input
                id="idNumber"
                placeholder="V-12345678"
                {...register('idNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
              />
              {errors.birthDate && (
                <p className="text-xs text-destructive">{errors.birthDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Relación *</Label>
              <Controller
                name="relationship"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHILD">Hijo/a</SelectItem>
                      <SelectItem value="SPOUSE">Cónyuge</SelectItem>
                      <SelectItem value="PARENT">Padre/Madre</SelectItem>
                      <SelectItem value="SIBLING">Hermano/a</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.relationship && (
                <p className="text-xs text-destructive">{errors.relationship.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género *</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Masculino</SelectItem>
                      <SelectItem value="FEMALE">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Beneficios</Label>
            <div className="space-y-2">
              <Controller
                name="receivesHealthInsurance"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="healthInsurance" 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="healthInsurance"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Seguro de Salud
                    </label>
                  </div>
                )}
              />
              <Controller
                name="receivesSchoolSupplies"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="schoolSupplies" 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="schoolSupplies"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Útiles Escolares
                    </label>
                  </div>
                )}
              />
              <Controller
                name="receivesToys"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="toys" 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="toys"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Juguetes Navideños
                    </label>
                  </div>
                )}
              />
              <Controller
                name="receivesChildBonus"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="childBonus" 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="childBonus"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Prima por Hijos (menores de 18 años)
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={createDependent.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createDependent.isPending}>
              {createDependent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agregar Dependiente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
