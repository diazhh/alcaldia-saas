import { Router } from 'express';
import securityController from './controllers/security.controller.js';
import { getDashboardStats } from './controllers/dashboard.controller.js';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de admin requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obtener estadísticas del dashboard principal
 * @access  Private (Todos los usuarios autenticados)
 */
router.get('/dashboard/stats', getDashboardStats);

// Rutas de seguridad requieren rol de ADMIN o SUPER_ADMIN
const securityRouter = Router();
securityRouter.use(authorize('SUPER_ADMIN', 'ADMIN'));

/**
 * @route   GET /api/admin/security/access-denied
 * @desc    Obtener logs de accesos denegados
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
securityRouter.get('/access-denied', securityController.getAccessDeniedLogs);

/**
 * @route   GET /api/admin/security/access-denied/stats
 * @desc    Obtener estadísticas de accesos denegados
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
securityRouter.get('/access-denied/stats', securityController.getAccessDeniedStatistics);

/**
 * @route   DELETE /api/admin/security/access-denied
 * @desc    Limpiar logs de accesos denegados
 * @access  Private (SUPER_ADMIN)
 */
securityRouter.delete('/access-denied', authorize('SUPER_ADMIN'), securityController.clearAccessDeniedLogs);

/**
 * @route   GET /api/admin/security/permissions
 * @desc    Obtener matriz de permisos completa
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
securityRouter.get('/permissions', securityController.getPermissionsMatrix);

/**
 * @route   GET /api/admin/security/permissions/:role
 * @desc    Obtener permisos de un rol específico
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
securityRouter.get('/permissions/:role', securityController.getRolePermissions);

/**
 * @route   GET /api/admin/security/my-permissions
 * @desc    Obtener permisos del usuario actual
 * @access  Private (Todos los usuarios autenticados)
 */
securityRouter.get('/my-permissions', securityController.getMyPermissions);

// Montar rutas de seguridad
router.use('/security', securityRouter);

export default router;
