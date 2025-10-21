import { z } from 'zod';

/**
 * Schema de validación para crear un proyecto
 */
export const createProjectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z.string().optional(),
  budget: z.number().positive('El presupuesto debe ser un número positivo'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  startDate: z.string().datetime('Fecha de inicio inválida').or(z.date()),
  endDate: z.string().datetime('Fecha de fin inválida').or(z.date()),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  sector: z.string().min(2, 'El sector es requerido'),
  category: z.string().min(2, 'La categoría es requerida'),
  beneficiaries: z.number().int().positive().optional(),
  managerId: z.string().uuid('ID de manager inválido').optional(), // Opcional, se puede usar el usuario autenticado
  departmentId: z.string().uuid('ID de departamento inválido').optional(),
  objectives: z.string().optional(),
  scope: z.string().optional(),
});

/**
 * Schema de validación para actualizar un proyecto
 */
export const updateProjectSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  status: z.enum(['PLANNING', 'APPROVED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  actualStartDate: z.string().datetime().or(z.date()).optional(),
  actualEndDate: z.string().datetime().or(z.date()).optional(),
  location: z.string().min(3).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  sector: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  beneficiaries: z.number().int().positive().optional(),
  managerId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  objectives: z.string().optional(),
  scope: z.string().optional(),
});

/**
 * Schema de validación para crear un hito
 */
export const createMilestoneSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  description: z.string().optional(),
  dueDate: z.string().datetime('Fecha límite inválida').or(z.date()),
  order: z.number().int().min(0).default(0),
});

/**
 * Schema de validación para actualizar un hito
 */
export const updateMilestoneSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
  completedAt: z.string().datetime().or(z.date()).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']).optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Schema de validación para crear un gasto
 */
export const createExpenseSchema = z.object({
  concept: z.string().min(3, 'El concepto debe tener al menos 3 caracteres').max(200),
  description: z.string().optional(),
  amount: z.number().positive('El monto debe ser un número positivo'),
  date: z.string().datetime('Fecha inválida').or(z.date()),
  category: z.string().min(2, 'La categoría es requerida'),
  invoice: z.string().optional(),
  supplier: z.string().optional(),
});

/**
 * Schema de validación para actualizar un gasto
 */
export const updateExpenseSchema = z.object({
  concept: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  category: z.string().min(2).optional(),
  invoice: z.string().optional(),
  supplier: z.string().optional(),
});

/**
 * Schema de validación para agregar una foto
 */
export const createPhotoSchema = z.object({
  caption: z.string().optional(),
  type: z.enum(['BEFORE', 'DURING', 'AFTER', 'INSPECTION']).default('DURING'),
  takenAt: z.string().datetime().or(z.date()).default(() => new Date()),
});
