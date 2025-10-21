import departmentPermissionService from './permission.service.js';
import { AppError } from '../../shared/utils/errors.js';
import { z } from 'zod';

/**
 * Esquemas de validación para permisos
 */
const assignPermissionSchema = z.object({
  module: z.string().min(1, 'El módulo es requerido'),
  action: z.enum(['create', 'read', 'update', 'delete'], {
    errorMap: () => ({ message: 'Acción inválida. Debe ser: create, read, update o delete' }),
  }),
  resource: z.string().optional().nullable(),
});

const bulkPermissionsSchema = z.object({
  permissions: z.array(assignPermissionSchema).min(1, 'Debe proporcionar al menos un permiso'),
});

/**
 * Controlador para gestión de permisos por departamento
 */
class DepartmentPermissionController {
  /**
   * Asignar un permiso a un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async assignPermission(req, res, next) {
    try {
      const { departmentId } = req.params;
      const validatedData = assignPermissionSchema.parse(req.body);

      const permission = await departmentPermissionService.assignPermission(departmentId, validatedData);

      res.status(201).json({
        success: true,
        message: 'Permiso asignado exitosamente',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remover un permiso
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async removePermission(req, res, next) {
    try {
      const { permissionId } = req.params;

      await departmentPermissionService.removePermission(permissionId);

      res.json({
        success: true,
        message: 'Permiso removido exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar permisos de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listDepartmentPermissions(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { module, action } = req.query;

      const permissions = await departmentPermissionService.listDepartmentPermissions(departmentId, {
        module,
        action,
      });

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener permisos de un usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async getUserPermissions(req, res, next) {
    try {
      const { userId } = req.params;

      const permissions = await departmentPermissionService.getUserPermissions(userId);

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar permisos en lote
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async assignBulkPermissions(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { permissions } = bulkPermissionsSchema.parse(req.body);

      const created = await departmentPermissionService.assignBulkPermissions(departmentId, permissions);

      res.status(201).json({
        success: true,
        message: `${created.length} permisos asignados exitosamente`,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Copiar permisos de un departamento a otro
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async copyPermissions(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { targetDepartmentId } = req.body;

      if (!targetDepartmentId) {
        throw new AppError('El ID del departamento destino es requerido', 400);
      }

      const copied = await departmentPermissionService.copyPermissions(departmentId, targetDepartmentId);

      res.json({
        success: true,
        message: `${copied.length} permisos copiados exitosamente`,
        data: copied,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentPermissionController();
