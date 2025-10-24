import permissionService from '../../shared/services/permission.service.js';
import { successResponse } from '../../shared/utils/response.js';
import prisma from '../../config/database.js';

/**
 * Controlador de Permisos
 * Gestiona endpoints relacionados con permisos y autorización
 */
class PermissionsController {
  /**
   * Obtener permisos del usuario autenticado
   * GET /api/permissions/me
   */
  async getMyPermissions(req, res, next) {
    try {
      const userId = req.user.id;

      const permissions = await permissionService.getUserPermissions(userId);

      return successResponse(res, permissions, 'Permisos obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   * GET /api/permissions/check?module=projects&action=create
   */
  async checkPermission(req, res, next) {
    try {
      const userId = req.user.id;
      const { module, action } = req.query;

      if (!module || !action) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren los parámetros module y action',
        });
      }

      const hasPermission = await permissionService.hasPermission(
        userId,
        module,
        action
      );

      return successResponse(
        res,
        { hasPermission, module, action },
        hasPermission ? 'Permiso concedido' : 'Permiso denegado'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar acceso a un módulo
   * GET /api/permissions/check-module?module=projects
   */
  async checkModuleAccess(req, res, next) {
    try {
      const userId = req.user.id;
      const { module } = req.query;

      if (!module) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el parámetro module',
        });
      }

      const hasAccess = await permissionService.canAccessModule(userId, module);

      return successResponse(
        res,
        { hasAccess, module },
        hasAccess ? 'Acceso concedido' : 'Acceso denegado'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Otorgar permiso excepcional a un usuario
   * POST /api/permissions/grant
   * Body: { userId, permissionId, reason, expiresAt }
   */
  async grantPermission(req, res, next) {
    try {
      const grantedBy = req.user.id;
      const { userId, permissionId, reason, expiresAt } = req.body;

      const userPermission = await permissionService.grantPermission(
        userId,
        permissionId,
        grantedBy,
        reason,
        expiresAt ? new Date(expiresAt) : null
      );

      return successResponse(
        res,
        userPermission,
        'Permiso otorgado exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revocar permiso a un usuario
   * POST /api/permissions/revoke
   * Body: { userId, permissionId, reason }
   */
  async revokePermission(req, res, next) {
    try {
      const { userId, permissionId, reason } = req.body;

      const userPermission = await permissionService.revokePermission(
        userId,
        permissionId,
        reason
      );

      return successResponse(
        res,
        userPermission,
        'Permiso revocado exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar permiso excepcional de un usuario
   * DELETE /api/permissions/user/:userId/permission/:permissionId
   */
  async removeUserPermission(req, res, next) {
    try {
      const { userId, permissionId } = req.params;

      await permissionService.removeUserPermission(userId, permissionId);

      return successResponse(res, null, 'Permiso excepcional eliminado');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener permisos de un rol
   * GET /api/permissions/role/:role
   */
  async getRolePermissions(req, res, next) {
    try {
      const { role } = req.params;

      const permissions = await permissionService.getRolePermissions(role);

      return successResponse(
        res,
        permissions,
        'Permisos del rol obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sincronizar permisos de un rol
   * PUT /api/permissions/role/:role
   * Body: { permissionIds: [] }
   */
  async syncRolePermissions(req, res, next) {
    try {
      const { role } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({
          success: false,
          message: 'permissionIds debe ser un array',
        });
      }

      await permissionService.syncRolePermissions(role, permissionIds);

      return successResponse(
        res,
        null,
        'Permisos del rol sincronizados exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los permisos disponibles
   * GET /api/permissions/all
   */
  async getAllPermissions(req, res, next) {
    try {
      const permissions = await prisma.permission.findMany({
        where: { isActive: true },
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
      });

      // Agrupar por módulo
      const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
          acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
      }, {});

      return successResponse(
        res,
        {
          permissions,
          grouped,
          total: permissions.length,
        },
        'Permisos obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener permisos excepcionales de un usuario
   * GET /api/permissions/user/:userId
   */
  async getUserExceptionalPermissions(req, res, next) {
    try {
      const { userId } = req.params;

      const userPermissions = await prisma.userPermission.findMany({
        where: { userId },
        include: {
          permission: true,
          granter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return successResponse(
        res,
        userPermissions,
        'Permisos excepcionales obtenidos'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener permisos de un rol específico
   * GET /api/permissions/role/:role
   */
  async getPermissionsByRole(req, res, next) {
    try {
      const { role } = req.params;

      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role },
        include: {
          permission: {
            select: { id: true, name: true, module: true, action: true, description: true },
          },
        },
      });

      return successResponse(
        res,
        rolePermissions,
        `Permisos del rol ${role} obtenidos exitosamente`
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new PermissionsController();
