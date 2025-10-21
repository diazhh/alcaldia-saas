import departmentPermissionService from '../../modules/departments/permission.service.js';
import prisma from '../../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Middleware para verificar permisos por departamento
 * @param {string} module - Módulo requerido
 * @param {string} action - Acción requerida
 * @param {Object} options - Opciones adicionales
 * @returns {Function} Middleware de Express
 */
export const requireDepartmentPermission = (module, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const { resource = null, requireSpecificDepartment = false } = options;

      // El usuario debe estar autenticado (verificado por el middleware authenticate)
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const userId = req.user.id;

      // Si se requiere un departamento específico, verificarlo
      if (requireSpecificDepartment) {
        const departmentId = req.params.departmentId || req.body.departmentId;

        if (!departmentId) {
          throw new AppError('ID de departamento requerido', 400);
        }

        const hasPermission = await departmentPermissionService.hasPermission(
          userId,
          departmentId,
          module,
          action,
          resource
        );

        if (!hasPermission) {
          // Log del intento denegado
          console.warn(`[PERMISSION DENIED] User ${userId} attempted ${action} on ${module} in department ${departmentId}`);
          
          throw new AppError(
            `No tiene permisos para realizar esta acción (${action}) en el módulo ${module} de este departamento`,
            403
          );
        }
      } else {
        // Verificar si tiene el permiso en cualquiera de sus departamentos
        const hasPermission = await departmentPermissionService.hasPermissionInAnyDepartment(
          userId,
          module,
          action,
          resource
        );

        if (!hasPermission) {
          // Log del intento denegado
          console.warn(`[PERMISSION DENIED] User ${userId} attempted ${action} on ${module} (no department access)`);
          
          throw new AppError(
            `No tiene permisos para realizar esta acción (${action}) en el módulo ${module}`,
            403
          );
        }
      }

      // Si tiene el permiso, continuar
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar que el usuario pertenece a un departamento específico
 * @param {Object} options - Opciones de verificación
 * @returns {Function} Middleware de Express
 */
export const requireDepartmentMembership = (options = {}) => {
  return async (req, res, next) => {
    try {
      const { minRole = null } = options;

      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const userId = req.user.id;
      const departmentId = req.params.departmentId || req.body.departmentId;

      if (!departmentId) {
        throw new AppError('ID de departamento requerido', 400);
      }

      // Verificar que el usuario pertenece al departamento
      const userDepartment = await prisma.userDepartment.findUnique({
        where: {
          userId_departmentId: {
            userId,
            departmentId,
          },
        },
      });

      if (!userDepartment) {
        console.warn(`[MEMBERSHIP DENIED] User ${userId} is not member of department ${departmentId}`);
        throw new AppError('No pertenece a este departamento', 403);
      }

      // Si se requiere un rol mínimo, verificarlo
      if (minRole) {
        const roleHierarchy = ['ASSISTANT', 'MEMBER', 'COORDINATOR', 'SUPERVISOR', 'HEAD'];
        const userRoleIndex = roleHierarchy.indexOf(userDepartment.role);
        const minRoleIndex = roleHierarchy.indexOf(minRole);

        if (userRoleIndex < minRoleIndex) {
          console.warn(
            `[ROLE DENIED] User ${userId} has role ${userDepartment.role} but ${minRole} required in department ${departmentId}`
          );
          throw new AppError(`Se requiere el rol de ${minRole} o superior en este departamento`, 403);
        }
      }

      // Agregar información del departamento al request
      req.userDepartment = userDepartment;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware combinado: verifica rol del sistema Y permisos de departamento
 * @param {Array} allowedRoles - Roles del sistema permitidos
 * @param {string} module - Módulo requerido
 * @param {string} action - Acción requerida
 * @returns {Function} Middleware de Express
 */
export const requireRoleAndDepartmentPermission = (allowedRoles, module, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      // Verificar rol del sistema
      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('No tiene permisos suficientes', 403);
      }

      // Si es SUPER_ADMIN, permitir sin verificar departamento
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Para otros roles, verificar permisos de departamento
      const userId = req.user.id;
      const hasPermission = await departmentPermissionService.hasPermissionInAnyDepartment(
        userId,
        module,
        action
      );

      if (!hasPermission) {
        console.warn(
          `[COMBINED PERMISSION DENIED] User ${userId} with role ${req.user.role} attempted ${action} on ${module}`
        );
        throw new AppError(
          `No tiene permisos para realizar esta acción en el módulo ${module}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
