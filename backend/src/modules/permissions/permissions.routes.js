import { Router } from 'express';
import permissionsController from './permissions.controller.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { requireAdmin, requireSuperAdmin } from '../../shared/middlewares/authorize.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';
import {
  grantPermissionSchema,
  revokePermissionSchema,
  syncRolePermissionsSchema,
} from './permissions.validations.js';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (requieren autenticación)
// ============================================

/**
 * @route   GET /api/permissions/me
 * @desc    Obtener permisos del usuario autenticado
 * @access  Private
 */
router.get('/me', authenticate, permissionsController.getMyPermissions);

/**
 * @route   GET /api/permissions/check
 * @desc    Verificar si el usuario tiene un permiso específico
 * @query   module, action
 * @access  Private
 */
router.get('/check', authenticate, permissionsController.checkPermission);

/**
 * @route   GET /api/permissions/check-module
 * @desc    Verificar si el usuario tiene acceso a un módulo
 * @query   module
 * @access  Private
 */
router.get(
  '/check-module',
  authenticate,
  permissionsController.checkModuleAccess
);

// ============================================
// RUTAS DE ADMINISTRACIÓN (solo ADMIN+)
// ============================================

/**
 * @route   GET /api/permissions/all
 * @desc    Obtener todos los permisos disponibles
 * @access  Private (Admin)
 */
router.get('/all', authenticate, requireAdmin, permissionsController.getAllPermissions);

/**
 * @route   GET /api/permissions/role/:role
 * @desc    Obtener permisos de un rol específico
 * @access  Private (Admin)
 */
router.get(
  '/role/:role',
  authenticate,
  requireAdmin,
  permissionsController.getRolePermissions
);

/**
 * @route   PUT /api/permissions/role/:role
 * @desc    Sincronizar permisos de un rol
 * @access  Private (Super Admin)
 */
router.put(
  '/role/:role',
  authenticate,
  requireSuperAdmin,
  validate(syncRolePermissionsSchema),
  permissionsController.syncRolePermissions
);

/**
 * @route   GET /api/permissions/user/:userId
 * @desc    Obtener permisos excepcionales de un usuario
 * @access  Private (Admin)
 */
router.get(
  '/user/:userId',
  authenticate,
  requireAdmin,
  permissionsController.getUserExceptionalPermissions
);

/**
 * @route   POST /api/permissions/grant
 * @desc    Otorgar permiso excepcional a un usuario
 * @access  Private (Admin)
 */
router.post(
  '/grant',
  authenticate,
  requireAdmin,
  validate(grantPermissionSchema),
  permissionsController.grantPermission
);

/**
 * @route   POST /api/permissions/revoke
 * @desc    Revocar permiso a un usuario
 * @access  Private (Admin)
 */
router.post(
  '/revoke',
  authenticate,
  requireAdmin,
  validate(revokePermissionSchema),
  permissionsController.revokePermission
);

/**
 * @route   DELETE /api/permissions/user/:userId/permission/:permissionId
 * @desc    Eliminar permiso excepcional de un usuario
 * @access  Private (Admin)
 */
router.delete(
  '/user/:userId/permission/:permissionId',
  authenticate,
  requireAdmin,
  permissionsController.removeUserPermission
);

export default router;
