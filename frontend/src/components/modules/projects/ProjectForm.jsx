'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

const projectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  budget: z.string().min(1, 'El presupuesto es requerido'),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  location: z.string().min(3, 'La ubicación es requerida'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  sector: z.string().min(2, 'El sector es requerido'),
  category: z.string().min(2, 'La categoría es requerida'),
  beneficiaries: z.string().optional(),
  managerId: z.string().min(1, 'El responsable es requerido'),
});

const statusOptions = [
  { value: 'PLANNING', label: 'Planificación' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

/**
 * Formulario para crear o editar un proyecto
 * @param {Object} initialData - Datos iniciales del proyecto (para edición)
 * @param {Function} onSubmit - Callback al enviar el formulario
 * @param {boolean} isLoading - Estado de carga
 * @param {Function} onCancel - Callback al cancelar
 * @param {Function} onLocationSelect - Callback para seleccionar ubicación en mapa
 */
export default function ProjectForm({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  onCancel,
  onLocationSelect,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      status: 'PLANNING',
      priority: 'MEDIUM',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        budget: initialData.budget?.toString() || '',
        beneficiaries: initialData.beneficiaries?.toString() || '',
        latitude: initialData.latitude?.toString() || '',
        longitude: initialData.longitude?.toString() || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      budget: parseFloat(data.budget),
      beneficiaries: data.beneficiaries ? parseInt(data.beneficiaries) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    };
    onSubmit(formattedData);
  };

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Proyecto *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Rehabilitación de Vía Principal"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del proyecto..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sector">Sector *</Label>
              <Input
                id="sector"
                {...register('sector')}
                placeholder="Ej: Vialidad, Salud, Educación"
              />
              {errors.sector && (
                <p className="text-sm text-red-600 mt-1">{errors.sector.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Ej: Obra Civil, Social, Tecnológico"
              />
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presupuesto y Fechas */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto y Cronograma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="budget">Presupuesto (Bs.) *</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                {...register('budget')}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="text-sm text-red-600 mt-1">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">Fecha de Fin *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Estado *</Label>
              <Select
                onValueChange={(value) => setValue('status', value)}
                defaultValue={watch('status')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Prioridad *</Label>
              <Select
                onValueChange={(value) => setValue('priority', value)}
                defaultValue={watch('priority')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ubicación y Beneficiarios */}
      <Card>
        <CardHeader>
          <CardTitle>Ubicación y Beneficiarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ej: Av. Principal, Sector Centro"
            />
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="10.123456"
              />
              {errors.latitude && (
                <p className="text-sm text-red-600 mt-1">{errors.latitude.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="longitude">Longitud</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="-66.123456"
              />
              {errors.longitude && (
                <p className="text-sm text-red-600 mt-1">{errors.longitude.message}</p>
              )}
            </div>
          </div>

          {onLocationSelect && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onLocationSelect(latitude, longitude)}
            >
              Seleccionar en Mapa
            </Button>
          )}

          <div>
            <Label htmlFor="beneficiaries">Número de Beneficiarios</Label>
            <Input
              id="beneficiaries"
              type="number"
              {...register('beneficiaries')}
              placeholder="0"
            />
            {errors.beneficiaries && (
              <p className="text-sm text-red-600 mt-1">{errors.beneficiaries.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="managerId">Responsable del Proyecto *</Label>
            <Input
              id="managerId"
              {...register('managerId')}
              placeholder="ID del usuario responsable"
            />
            {errors.managerId && (
              <p className="text-sm text-red-600 mt-1">{errors.managerId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  );
}

ProjectForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onCancel: PropTypes.func,
  onLocationSelect: PropTypes.func,
};
