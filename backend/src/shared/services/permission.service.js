import prisma from '../../config/database.js';
import { ROLES } from '../constants/permissions.js';

/**
 * Servicio de Permisos
 * Gestiona la lógica de permisos del sistema
 */
class PermissionService {
  /**
   * Verificar si un usuario tiene un permiso específico
   * Soporta formato antiguo (module, action) y nuevo (permissionName)
   * @param {string} userId - ID del usuario
   * @param {string} moduleOrPermission - Módulo del sistema o nombre completo del permiso
   * @param {string} action - Acción a verificar (opcional si se usa formato granular)
   * @returns {Promise<boolean>} true si tiene permiso, false en caso contrario
   */
  async hasPermission(userId, moduleOrPermission, action = null) {
    try {
      // 1. Obtener usuario con su rol
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return false;
      }

      // 2. SUPER_ADMIN tiene acceso a todo
      if (user.role === ROLES.SUPER_ADMIN) {
        return true;
      }

      // 3. Buscar el permiso - soporta ambos formatos
      let permission;

      if (action) {
        // Formato antiguo: hasPermission(userId, 'finanzas', 'ver')
        permission = await prisma.permission.findFirst({
          where: {
            module: moduleOrPermission,
            action: action,
          },
          select: { id: true },
        });
      } else {
        // Formato granular: hasPermission(userId, 'finanzas.cajas_chicas.aprobar')
        permission = await prisma.permission.findUnique({
          where: { name: moduleOrPermission },
          select: { id: true },
        });
      }

      if (!permission) {
        const permStr = action ? `${moduleOrPermission}:${action}` : moduleOrPermission;
        console.warn(`[PERMISSION] Permiso no encontrado: ${permStr}`);
        return false;
      }

      // 4. Verificar si hay permiso REVOCADO a nivel de usuario (override)
      const userPermissionRevoke = await prisma.userPermission.findFirst({
        where: {
          userId,
          permissionId: permission.id,
          type: 'REVOKE',
        },
      });

      if (userPermissionRevoke) {
        // Si está revocado a nivel usuario, no tiene permiso
        return false;
      }

      // 5. Verificar si tiene permiso GRANT a nivel de usuario
      const userPermissionGrant = await prisma.userPermission.findFirst({
        where: {
          userId,
          permissionId: permission.id,
          type: 'GRANT',
          OR: [
            { expiresAt: null }, // Permanente
            { expiresAt: { gt: new Date() } }, // No expirado
          ],
        },
      });

      if (userPermissionGrant) {
        return true;
      }

      // 6. Verificar permisos del ROL estándar
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          role: user.role,
          permissionId: permission.id,
        },
      });

      if (rolePermission) {
        return true;
      }

      // 7. Verificar permisos de ROLES PERSONALIZADOS
      const customRolePermission = await prisma.userCustomRole.findFirst({
        where: {
          userId,
          role: {
            isActive: true,
            permissions: {
              some: {
                permissionId: permission.id,
              },
            },
          },
        },
      });

      return !!customRolePermission;
    } catch (error) {
      console.error('[PERMISSION] Error verificando permiso:', error);
      return false;
    }
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos especificados
   * @param {string} userId - ID del usuario
   * @param {Array<string>} permissions - Array de permisos en formato "module:action"
   * @returns {Promise<boolean>} true si tiene al menos uno, false en caso contrario
   */
  async hasAnyPermission(userId, permissions) {
    for (const perm of permissions) {
      const [module, action] = perm.split(':');
      if (await this.hasPermission(userId, module, action)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   * @param {string} userId - ID del usuario
   * @param {Array<string>} permissions - Array de permisos en formato "module:action"
   * @returns {Promise<boolean>} true si tiene todos, false en caso contrario
   */
  async hasAllPermissions(userId, permissions) {
    for (const perm of permissions) {
      const [module, action] = perm.split(':');
      if (!(await this.hasPermission(userId, module, action))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Obtener todos los permisos del usuario
   * Retorna objeto con estructura: { module: [actions] }
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Objeto con permisos agrupados por módulo
   */
  async getUserPermissions(userId) {
    try {
      // Obtener usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return {};
      }

      // SUPER_ADMIN tiene todos los permisos
      if (user.role === ROLES.SUPER_ADMIN) {
        // Obtener TODOS los permisos del sistema
        const allPermissions = await prisma.permission.findMany({
          where: { isActive: true },
          select: { module: true, action: true, name: true },
        });

        return this._groupPermissionsByModule(allPermissions);
      }

      // 1. Obtener permisos del ROL estándar
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role: user.role },
        include: {
          permission: {
            select: { id: true, module: true, action: true, name: true, isActive: true },
          },
        },
      });

      // 2. Obtener permisos de ROLES PERSONALIZADOS
      const customRolePermissions = await prisma.userCustomRole.findMany({
        where: {
          userId,
          role: { isActive: true },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: {
                    select: { id: true, module: true, action: true, name: true, isActive: true },
                  },
                },
              },
            },
          },
        },
      });

      // Extraer permisos de roles personalizados
      const customPerms = customRolePermissions.flatMap(ucr =>
        ucr.role.permissions.map(crp => crp.permission)
      );

      // 3. Obtener permisos GRANT del usuario (excepcionales)
      const userGrantPermissions = await prisma.userPermission.findMany({
        where: {
          userId,
          type: 'GRANT',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          permission: {
            select: { id: true, module: true, action: true, name: true, isActive: true },
          },
        },
      });

      // 4. Obtener permisos REVOKE del usuario
      const userRevokePermissions = await prisma.userPermission.findMany({
        where: {
          userId,
          type: 'REVOKE',
        },
        select: { permissionId: true },
      });

      const revokedPermissionIds = new Set(
        userRevokePermissions.map((p) => p.permissionId)
      );

      // 5. Combinar permisos de todas las fuentes
      const allUserPermissions = [
        ...rolePermissions.map((rp) => rp.permission),
        ...customPerms,
        ...userGrantPermissions.map((up) => up.permission),
      ].filter((perm) => perm && perm.isActive && !revokedPermissionIds.has(perm.id));

      return this._groupPermissionsByModule(allUserPermissions);
    } catch (error) {
      console.error('[PERMISSION] Error obteniendo permisos de usuario:', error);
      return {};
    }
  }

  /**
   * Agrupar permisos por módulo
   * @private
   * @param {Array} permissions - Array de permisos con module, action y name
   * @returns {Object} Objeto con estructura { module: [actions] }
   */
  _groupPermissionsByModule(permissions) {
    const grouped = {};

    permissions.forEach((perm) => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }

      // Para permisos granulares (con name), agregar el nombre completo
      // Para permisos legacy, agregar solo la action
      const permissionKey = perm.name || perm.action;

      if (!grouped[perm.module].includes(permissionKey)) {
        grouped[perm.module].push(permissionKey);
      }

      // También agregar la action por compatibilidad con código legacy
      if (perm.action && !grouped[perm.module].includes(perm.action)) {
        grouped[perm.module].push(perm.action);
      }
    });

    return grouped;
  }

  /**
   * Verificar si el usuario puede acceder a un módulo (tiene al menos READ)
   * @param {string} userId - ID del usuario
   * @param {string} module - Módulo
   * @returns {Promise<boolean>} true si tiene acceso
   */
  async canAccessModule(userId, module) {
    // Verificar si tiene READ o MANAGE
    return (
      (await this.hasPermission(userId, module, 'read')) ||
      (await this.hasPermission(userId, module, 'manage'))
    );
  }

  /**
   * Otorgar permiso excepcional a un usuario
   * @param {string} userId - ID del usuario
   * @param {string} permissionId - ID del permiso
   * @param {string} grantedBy - ID del usuario que otorga
   * @param {string} reason - Razón del otorgamiento
   * @param {Date|null} expiresAt - Fecha de expiración (null = permanente)
   * @returns {Promise<Object>} UserPermission creado
   */
  async grantPermission(userId, permissionId, grantedBy, reason = null, expiresAt = null) {
    try {
      const userPermission = await prisma.userPermission.create({
        data: {
          userId,
          permissionId,
          type: 'GRANT',
          reason,
          grantedBy,
          expiresAt,
        },
        include: {
          permission: true,
        },
      });

      console.log(`[PERMISSION] Permiso otorgado: ${userPermission.permission.name} a usuario ${userId}`);

      return userPermission;
    } catch (error) {
      console.error('[PERMISSION] Error otorgando permiso:', error);
      throw error;
    }
  }

  /**
   * Revocar permiso a un usuario
   * @param {string} userId - ID del usuario
   * @param {string} permissionId - ID del permiso
   * @param {string} reason - Razón de la revocación
   * @returns {Promise<Object>} UserPermission creado
   */
  async revokePermission(userId, permissionId, reason = null) {
    try {
      const userPermission = await prisma.userPermission.create({
        data: {
          userId,
          permissionId,
          type: 'REVOKE',
          reason,
        },
        include: {
          permission: true,
        },
      });

      console.log(`[PERMISSION] Permiso revocado: ${userPermission.permission.name} a usuario ${userId}`);

      return userPermission;
    } catch (error) {
      console.error('[PERMISSION] Error revocando permiso:', error);
      throw error;
    }
  }

  /**
   * Eliminar un permiso excepcional de usuario
   * @param {string} userId - ID del usuario
   * @param {string} permissionId - ID del permiso
   * @returns {Promise<void>}
   */
  async removeUserPermission(userId, permissionId) {
    try {
      await prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId,
            permissionId,
          },
        },
      });

      console.log(`[PERMISSION] Permiso excepcional eliminado para usuario ${userId}`);
    } catch (error) {
      console.error('[PERMISSION] Error eliminando permiso excepcional:', error);
      throw error;
    }
  }

  /**
   * Sincronizar permisos de un rol
   * @param {string} role - Rol
   * @param {Array<string>} permissionIds - IDs de permisos a asignar
   * @returns {Promise<void>}
   */
  async syncRolePermissions(role, permissionIds) {
    try {
      // Eliminar permisos actuales del rol
      await prisma.rolePermission.deleteMany({
        where: { role },
      });

      // Crear nuevos permisos
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          role,
          permissionId,
        })),
      });

      console.log(`[PERMISSION] Permisos sincronizados para rol ${role}`);
    } catch (error) {
      console.error('[PERMISSION] Error sincronizando permisos de rol:', error);
      throw error;
    }
  }

  /**
   * Obtener permisos de un rol
   * @param {string} role - Rol
   * @returns {Promise<Array>} Array de permisos
   */
  async getRolePermissions(role) {
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role },
        include: {
          permission: true,
        },
      });

      return rolePermissions.map((rp) => rp.permission);
    } catch (error) {
      console.error('[PERMISSION] Error obteniendo permisos de rol:', error);
      return [];
    }
  }
}

export default new PermissionService();
