import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';

/**
 * Servicio de Roles Personalizados
 */
class CustomRolesService {
  /**
   * Obtener todos los roles personalizados
   */
  async getAllRoles() {
    const roles = await prisma.customRole.findMany({
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                displayName: true,
                module: true,
                feature: true,
                action: true,
                category: true,
              },
            },
          },
        },
        userRoles: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' },
      ],
    });

    // Agregar contador de usuarios
    return roles.map(role => ({
      ...role,
      userCount: role.userRoles.length,
      permissionCount: role.permissions.length,
    }));
  }

  /**
   * Obtener un rol por ID
   */
  async getRoleById(id) {
    const role = await prisma.customRole.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundError('Rol no encontrado');
    }

    return role;
  }

  /**
   * Crear un nuevo rol personalizado
   */
  async createRole(roleData, createdBy) {
    const { name, description, permissionIds = [] } = roleData;

    // Verificar que no exista un rol con ese nombre
    const existing = await prisma.customRole.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictError('Ya existe un rol con ese nombre');
    }

    // Crear el rol
    const role = await prisma.customRole.create({
      data: {
        name,
        description,
        isSystem: false,
        isActive: true,
        createdBy,
      },
    });

    // Asignar permisos si se proporcionaron
    if (permissionIds.length > 0) {
      await this.assignPermissions(role.id, permissionIds);
    }

    return this.getRoleById(role.id);
  }

  /**
   * Actualizar un rol personalizado
   */
  async updateRole(id, roleData) {
    const { name, description, isActive, permissionIds } = roleData;

    const role = await prisma.customRole.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundError('Rol no encontrado');
    }

    // Actualizar el rol
    const updated = await prisma.customRole.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Actualizar permisos si se proporcionaron
    if (permissionIds) {
      await this.assignPermissions(id, permissionIds);
    }

    return this.getRoleById(id);
  }

  /**
   * Eliminar un rol personalizado
   */
  async deleteRole(id) {
    const role = await prisma.customRole.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new NotFoundError('Rol no encontrado');
    }

    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      throw new ConflictError('No se pueden eliminar roles del sistema');
    }

    // Verificar si hay usuarios asignados
    if (role.userRoles.length > 0) {
      throw new ConflictError(
        `No se puede eliminar el rol porque tiene ${role.userRoles.length} usuario(s) asignado(s)`
      );
    }

    // Eliminar permisos asociados
    await prisma.customRolePermission.deleteMany({
      where: { roleId: id },
    });

    // Eliminar el rol
    await prisma.customRole.delete({
      where: { id },
    });
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(roleId, permissionIds) {
    const role = await prisma.customRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundError('Rol no encontrado');
    }

    // Eliminar permisos actuales
    await prisma.customRolePermission.deleteMany({
      where: { roleId },
    });

    // Crear nuevos permisos
    if (permissionIds.length > 0) {
      await prisma.customRolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getRoleById(roleId);
  }

  /**
   * Obtener usuarios asignados a un rol
   */
  async getRoleUsers(roleId) {
    const role = await prisma.customRole.findUnique({
      where: { id: roleId },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundError('Rol no encontrado');
    }

    return role.userRoles.map(ur => ({
      ...ur.user,
      assignedAt: ur.assignedAt,
      assignedBy: ur.assignedBy,
    }));
  }

  /**
   * Asignar rol a un usuario
   */
  async assignRoleToUser(roleId, userId, assignedBy) {
    // Verificar que el rol existe
    const role = await prisma.customRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundError('Rol no encontrado');
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar si ya tiene el rol asignado
    const existing = await prisma.userCustomRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('El usuario ya tiene este rol asignado');
    }

    // Asignar el rol
    const assignment = await prisma.userCustomRole.create({
      data: {
        userId,
        roleId,
        assignedBy,
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return assignment;
  }

  /**
   * Remover rol de un usuario
   */
  async removeRoleFromUser(roleId, userId) {
    const assignment = await prisma.userCustomRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('Asignación de rol no encontrada');
    }

    await prisma.userCustomRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }
}

export default new CustomRolesService();
