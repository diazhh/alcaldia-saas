import { z } from 'zod';

/**
 * Esquemas de validación para el módulo de departamentos
 */

// Enum de tipos de departamento
export const departmentTypeEnum = z.enum([
  'DIRECCION',
  'COORDINACION',
  'DEPARTAMENTO',
  'UNIDAD',
  'SECCION',
  'OFICINA',
]);

// Enum de roles en departamento
export const departmentRoleEnum = z.enum([
  'HEAD',
  'SUPERVISOR',
  'COORDINATOR',
  'MEMBER',
  'ASSISTANT',
]);

/**
 * Validación para crear un departamento
 */
export const createDepartmentSchema = z.object({
  code: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  type: departmentTypeEnum,
  parentId: z.string().uuid('ID de departamento padre inválido').optional().nullable(),
  phone: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  location: z.string().max(200, 'La ubicación no puede exceder 200 caracteres').optional().nullable(),
  maxStaff: z.number().int().positive('El máximo de personal debe ser positivo').optional().nullable(),
});

/**
 * Validación para actualizar un departamento
 */
export const updateDepartmentSchema = z.object({
  code: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones')
    .optional(),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
  type: departmentTypeEnum.optional(),
  parentId: z.string().uuid('ID de departamento padre inválido').optional().nullable(),
  headUserId: z.string().uuid('ID de usuario jefe inválido').optional().nullable(),
  phone: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  location: z.string().max(200, 'La ubicación no puede exceder 200 caracteres').optional().nullable(),
  maxStaff: z.number().int().positive('El máximo de personal debe ser positivo').optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * Validación para asignar usuario a departamento
 */
export const assignUserSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  role: departmentRoleEnum,
  isPrimary: z.boolean().optional().default(false),
});

/**
 * Validación para actualizar rol de usuario en departamento
 */
export const updateUserRoleSchema = z.object({
  role: departmentRoleEnum,
  isPrimary: z.boolean().optional(),
});

/**
 * Validación de query params para listar departamentos
 */
export const listDepartmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  type: departmentTypeEnum.optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  hierarchical: z.coerce.boolean().optional().default(false),
});
