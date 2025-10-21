import { z } from 'zod';

/**
 * Schema de validación para registro de usuario
 */
export const registerSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*]/, 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)'),
  firstName: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  lastName: z
    .string({ required_error: 'El apellido es requerido' })
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .trim(),
  phone: z
    .string()
    .regex(/^\+58\s?\d{3}\s?\d{7}$/, 'Formato de teléfono inválido. Ejemplo: +58 414 1234567')
    .optional(),
});

/**
 * Schema de validación para login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'La contraseña es requerida' }),
});

/**
 * Schema de validación para cambio de contraseña
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'La contraseña actual es requerida' }),
  newPassword: z
    .string({ required_error: 'La nueva contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*]/, 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)'),
});

/**
 * Schema de validación para actualizar perfil
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^\+58\s?\d{3}\s?\d{7}$/, 'Formato de teléfono inválido. Ejemplo: +58 414 1234567')
    .optional(),
  avatar: z.string().url('URL de avatar inválida').optional(),
});
