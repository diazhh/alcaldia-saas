import prisma from '../../config/database.js';
import { AppError } from '../../shared/utils/errors.js';

/**
 * Servicio para gestión de permisos por departamento
 */
class DepartmentPermissionService {
  /**
   * Asignar un permiso a un departamento
   * @param {string} departmentId - ID del departamento
   * @param {Object} data - Datos del permiso (module, action, resource)
   * @returns {Promise<Object>} Permiso creado
   */
  async assignPermission(departmentId, data) {
    const { module, action, resource = null } = data;

    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Verificar que el permiso no existe ya
    const existing = await prisma.departmentPermission.findFirst({
      where: {
        departmentId,
        module,
        action,
        resource,
      },
    });

    if (existing) {
      throw new AppError('El permiso ya está asignado a este departamento', 400);
    }

    // Crear el permiso
    const permission = await prisma.departmentPermission.create({
      data: {
        departmentId,
        module,
        action,
        resource,
      },
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return permission;
  }

  /**
   * Remover un permiso de un departamento
   * @param {string} permissionId - ID del permiso
   * @returns {Promise<void>}
   */
  async removePermission(permissionId) {
    const permission = await prisma.departmentPermission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new AppError('Permiso no encontrado', 404);
    }

    await prisma.departmentPermission.delete({
      where: { id: permissionId },
    });
  }

  /**
   * Listar permisos de un departamento
   * @param {string} departmentId - ID del departamento
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de permisos
   */
  async listDepartmentPermissions(departmentId, filters = {}) {
    const { module, action } = filters;

    const where = { departmentId };
    if (module) where.module = module;
    if (action) where.action = action;

    const permissions = await prisma.departmentPermission.findMany({
      where,
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return permissions;
  }

  /**
   * Verificar si un usuario tiene un permiso específico en un departamento
   * @param {string} userId - ID del usuario
   * @param {string} departmentId - ID del departamento
   * @param {string} module - Módulo
   * @param {string} action - Acción
   * @param {string} resource - Recurso opcional
   * @returns {Promise<boolean>} True si tiene el permiso
   */
  async hasPermission(userId, departmentId, module, action, resource = null) {
    // Verificar que el usuario está asignado al departamento
    const userDepartment = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId,
          departmentId,
        },
      },
    });

    if (!userDepartment) {
      return false;
    }

    // Verificar que el departamento tiene el permiso
    const permission = await prisma.departmentPermission.findFirst({
      where: {
        departmentId,
        module,
        action,
        ...(resource && { resource }),
      },
    });

    return !!permission;
  }

  /**
   * Verificar si un usuario tiene permiso en cualquiera de sus departamentos
   * @param {string} userId - ID del usuario
   * @param {string} module - Módulo
   * @param {string} action - Acción
   * @param {string} resource - Recurso opcional
   * @returns {Promise<boolean>} True si tiene el permiso en algún departamento
   */
  async hasPermissionInAnyDepartment(userId, module, action, resource = null) {
    // Obtener todos los departamentos del usuario
    const userDepartments = await prisma.userDepartment.findMany({
      where: { userId },
      select: { departmentId: true },
    });

    if (userDepartments.length === 0) {
      return false;
    }

    const departmentIds = userDepartments.map((ud) => ud.departmentId);

    // Buscar si alguno de sus departamentos tiene el permiso
    const permission = await prisma.departmentPermission.findFirst({
      where: {
        departmentId: { in: departmentIds },
        module,
        action,
        ...(resource && { resource }),
      },
    });

    return !!permission;
  }

  /**
   * Obtener todos los permisos de un usuario (consolidados de todos sus departamentos)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de permisos únicos
   */
  async getUserPermissions(userId) {
    // Obtener todos los departamentos del usuario
    const userDepartments = await prisma.userDepartment.findMany({
      where: { userId },
      select: { departmentId: true },
    });

    if (userDepartments.length === 0) {
      return [];
    }

    const departmentIds = userDepartments.map((ud) => ud.departmentId);

    // Obtener todos los permisos de esos departamentos
    const permissions = await prisma.departmentPermission.findMany({
      where: {
        departmentId: { in: departmentIds },
      },
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return permissions;
  }

  /**
   * Asignar permisos en lote a un departamento
   * @param {string} departmentId - ID del departamento
   * @param {Array} permissions - Array de permisos {module, action, resource}
   * @returns {Promise<Array>} Permisos creados
   */
  async assignBulkPermissions(departmentId, permissions) {
    // Verificar que el departamento existe
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    // Crear permisos en lote
    const created = await prisma.$transaction(
      permissions.map((perm) =>
        prisma.departmentPermission.upsert({
          where: {
            departmentId_module_action_resource: {
              departmentId,
              module: perm.module,
              action: perm.action,
              resource: perm.resource || null,
            },
          },
          update: {},
          create: {
            departmentId,
            module: perm.module,
            action: perm.action,
            resource: perm.resource || null,
          },
        })
      )
    );

    return created;
  }

  /**
   * Copiar permisos de un departamento a otro
   * @param {string} sourceDepartmentId - ID del departamento origen
   * @param {string} targetDepartmentId - ID del departamento destino
   * @returns {Promise<Array>} Permisos copiados
   */
  async copyPermissions(sourceDepartmentId, targetDepartmentId) {
    // Verificar que ambos departamentos existen
    const [source, target] = await Promise.all([
      prisma.department.findUnique({ where: { id: sourceDepartmentId } }),
      prisma.department.findUnique({ where: { id: targetDepartmentId } }),
    ]);

    if (!source) {
      throw new AppError('Departamento origen no encontrado', 404);
    }

    if (!target) {
      throw new AppError('Departamento destino no encontrado', 404);
    }

    // Obtener permisos del departamento origen
    const sourcePermissions = await prisma.departmentPermission.findMany({
      where: { departmentId: sourceDepartmentId },
      select: {
        module: true,
        action: true,
        resource: true,
      },
    });

    // Copiar permisos al departamento destino
    const copied = await this.assignBulkPermissions(targetDepartmentId, sourcePermissions);

    return copied;
  }
}

export default new DepartmentPermissionService();
