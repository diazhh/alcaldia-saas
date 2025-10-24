import permissionService from '../services/permission.service.js';

/**
 * Middleware de Autorización
 * Verifica si el usuario tiene permiso para realizar una acción en un módulo
 *
 * @param {string} module - Módulo del sistema
 * @param {string} action - Acción requerida (create, read, update, delete, etc.)
 * @returns {Function} Middleware function
 *
 * @example
 * router.post('/proyectos', authenticate, authorize('projects', 'create'), createProject);
 */
export const authorize = (module, action) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const userId = req.user.id;

      // Verificar permiso
      const hasPermission = await permissionService.hasPermission(
        userId,
        module,
        action
      );

      if (!hasPermission) {
        console.warn(
          `[AUTHORIZE] Usuario ${userId} sin permiso: ${module}:${action}`
        );

        return res.status(403).json({
          success: false,
          message: `No tienes permiso para ${getActionDescription(action)} en ${module}`,
          code: 'FORBIDDEN',
        });
      }

      // Usuario autorizado, continuar
      next();
    } catch (error) {
      console.error('[AUTHORIZE] Error en middleware de autorización:', error);
      next(error);
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR logic)
 * El usuario necesita tener AL MENOS UNO de los permisos especificados
 *
 * @param {...string} permissions - Permisos en formato "module:action"
 * @returns {Function} Middleware function
 *
 * @example
 * router.get('/reportes', authenticate, requireAnyPermission('reports:read', 'dashboards:read'), getReports);
 */
export const requireAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const userId = req.user.id;

      // Verificar si tiene alguno de los permisos
      const hasAny = await permissionService.hasAnyPermission(userId, permissions);

      if (!hasAny) {
        console.warn(
          `[AUTHORIZE] Usuario ${userId} sin ninguno de los permisos: ${permissions.join(', ')}`
        );

        return res.status(403).json({
          success: false,
          message: 'No tienes los permisos necesarios para acceder a este recurso',
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (error) {
      console.error('[AUTHORIZE] Error en requireAnyPermission:', error);
      next(error);
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (AND logic)
 * El usuario necesita tener TODOS los permisos especificados
 *
 * @param {...string} permissions - Permisos en formato "module:action"
 * @returns {Function} Middleware function
 *
 * @example
 * router.post('/aprobar-presupuesto', authenticate, requireAllPermissions('budgets:approve', 'budgets:update'), approveB udget);
 */
export const requireAllPermissions = (...permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const userId = req.user.id;

      // Verificar si tiene todos los permisos
      const hasAll = await permissionService.hasAllPermissions(userId, permissions);

      if (!hasAll) {
        console.warn(
          `[AUTHORIZE] Usuario ${userId} sin todos los permisos requeridos: ${permissions.join(', ')}`
        );

        return res.status(403).json({
          success: false,
          message: 'No tienes todos los permisos necesarios para realizar esta acción',
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (error) {
      console.error('[AUTHORIZE] Error en requireAllPermissions:', error);
      next(error);
    }
  };
};

/**
 * Middleware para verificar acceso a módulo
 * Verifica si el usuario tiene al menos READ o MANAGE en el módulo
 *
 * @param {string} module - Módulo del sistema
 * @returns {Function} Middleware function
 *
 * @example
 * router.use('/proyectos', authenticate, requireModuleAccess('projects'));
 */
export const requireModuleAccess = (module) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const userId = req.user.id;

      // Verificar acceso al módulo
      const hasAccess = await permissionService.canAccessModule(userId, module);

      if (!hasAccess) {
        console.warn(
          `[AUTHORIZE] Usuario ${userId} sin acceso al módulo: ${module}`
        );

        return res.status(403).json({
          success: false,
          message: `No tienes acceso al módulo de ${module}`,
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (error) {
      console.error('[AUTHORIZE] Error en requireModuleAccess:', error);
      next(error);
    }
  };
};

/**
 * Middleware para verificar si el usuario es SUPER_ADMIN
 *
 * @example
 * router.delete('/system/reset', authenticate, requireSuperAdmin, resetSystem);
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Solo el SUPER_ADMIN puede realizar esta acción',
      code: 'FORBIDDEN',
    });
  }

  next();
};

/**
 * Middleware para verificar si el usuario es ADMIN o superior
 *
 * @example
 * router.post('/users', authenticate, requireAdmin, createUser);
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Solo administradores pueden realizar esta acción',
      code: 'FORBIDDEN',
    });
  }

  next();
};

/**
 * Helper para obtener descripción de acción
 * @private
 */
function getActionDescription(action) {
  const descriptions = {
    create: 'crear',
    read: 'ver',
    update: 'modificar',
    delete: 'eliminar',
    approve: 'aprobar',
    reject: 'rechazar',
    export: 'exportar',
    import: 'importar',
    manage: 'gestionar',
  };

  return descriptions[action] || action;
}
