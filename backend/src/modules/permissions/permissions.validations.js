import Joi from 'joi';

/**
 * Validación para otorgar permiso
 */
export const grantPermissionSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.base': 'userId debe ser un string',
    'string.uuid': 'userId debe ser un UUID válido',
    'any.required': 'userId es requerido',
  }),
  permissionId: Joi.string().uuid().required().messages({
    'string.base': 'permissionId debe ser un string',
    'string.uuid': 'permissionId debe ser un UUID válido',
    'any.required': 'permissionId es requerido',
  }),
  reason: Joi.string().max(500).optional().allow(null, '').messages({
    'string.base': 'reason debe ser un string',
    'string.max': 'reason no puede exceder 500 caracteres',
  }),
  expiresAt: Joi.date().iso().optional().allow(null).messages({
    'date.base': 'expiresAt debe ser una fecha válida',
    'date.format': 'expiresAt debe estar en formato ISO 8601',
  }),
});

/**
 * Validación para revocar permiso
 */
export const revokePermissionSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.base': 'userId debe ser un string',
    'string.uuid': 'userId debe ser un UUID válido',
    'any.required': 'userId es requerido',
  }),
  permissionId: Joi.string().uuid().required().messages({
    'string.base': 'permissionId debe ser un string',
    'string.uuid': 'permissionId debe ser un UUID válido',
    'any.required': 'permissionId es requerido',
  }),
  reason: Joi.string().max(500).optional().allow(null, '').messages({
    'string.base': 'reason debe ser un string',
    'string.max': 'reason no puede exceder 500 caracteres',
  }),
});

/**
 * Validación para sincronizar permisos de rol
 */
export const syncRolePermissionsSchema = Joi.object({
  permissionIds: Joi.array()
    .items(Joi.string().uuid())
    .required()
    .messages({
      'array.base': 'permissionIds debe ser un array',
      'any.required': 'permissionIds es requerido',
      'string.uuid': 'Cada permissionId debe ser un UUID válido',
    }),
});

/**
 * Validación para verificar permiso (query params)
 */
export const checkPermissionQuerySchema = Joi.object({
  module: Joi.string().required().messages({
    'string.base': 'module debe ser un string',
    'any.required': 'module es requerido',
  }),
  action: Joi.string().required().messages({
    'string.base': 'action debe ser un string',
    'any.required': 'action es requerido',
  }),
});

/**
 * Validación para verificar acceso a módulo (query params)
 */
export const checkModuleAccessQuerySchema = Joi.object({
  module: Joi.string().required().messages({
    'string.base': 'module debe ser un string',
    'any.required': 'module es requerido',
  }),
});
