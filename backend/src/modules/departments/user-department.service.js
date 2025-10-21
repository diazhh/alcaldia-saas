import prisma from '../../config/database.js';
import { AppError } from '../../shared/utils/errors.js';

/**
 * Servicio para gestión de asignación de usuarios a departamentos
 */
class UserDepartmentService {
  /**
   * Asignar un usuario a un departamento
   * @param {string} departmentId - ID del departamento
   * @param {Object} data - Datos de asignación (userId, role, isPrimary)
   * @returns {Promise<Object>} Asignación creada
   */
  async assignUser(departmentId, data) {
    const { userId, role, isPrimary = false } = data;

    // Verificar que el departamento existe y está activo
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!department) {
      throw new AppError('Departamento no encontrado', 404);
    }

    if (!department.isActive) {
      throw new AppError('No se puede asignar usuarios a un departamento inactivo', 400);
    }

    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (!user.isActive) {
      throw new AppError('No se puede asignar un usuario inactivo', 400);
    }

    // Verificar que no exceda el límite de personal
    if (department.maxStaff && department._count.users >= department.maxStaff) {
      throw new AppError(
        `El departamento ha alcanzado su límite máximo de ${department.maxStaff} empleados`,
        400
      );
    }

    // Verificar que el usuario no esté ya asignado a este departamento
    const existing = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId,
          departmentId,
        },
      },
    });

    if (existing) {
      throw new AppError('El usuario ya está asignado a este departamento', 400);
    }

    // Si es HEAD, verificar que no haya otro HEAD
    if (role === 'HEAD') {
      const existingHead = await prisma.userDepartment.findFirst({
        where: {
          departmentId,
          role: 'HEAD',
        },
      });

      if (existingHead) {
        throw new AppError('El departamento ya tiene un jefe asignado', 400);
      }
    }

    // Si se marca como principal, desmarcar otros departamentos principales del usuario
    if (isPrimary) {
      await prisma.userDepartment.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    // Crear la asignación
    const assignment = await prisma.userDepartment.create({
      data: {
        userId,
        departmentId,
        role,
        isPrimary,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
          },
        },
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Si el rol es HEAD, actualizar el headUserId del departamento
    if (role === 'HEAD') {
      await prisma.department.update({
        where: { id: departmentId },
        data: { headUserId: userId },
      });
    }

    return assignment;
  }

  /**
   * Remover un usuario de un departamento
   * @param {string} departmentId - ID del departamento
   * @param {string} userId - ID del usuario
   * @returns {Promise<void>}
   */
  async removeUser(departmentId, userId) {
    // Verificar que la asignación existe
    const assignment = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId,
          departmentId,
        },
      },
    });

    if (!assignment) {
      throw new AppError('El usuario no está asignado a este departamento', 404);
    }

    // Si es HEAD, limpiar el headUserId del departamento
    if (assignment.role === 'HEAD') {
      await prisma.department.update({
        where: { id: departmentId },
        data: { headUserId: null },
      });
    }

    // Eliminar la asignación
    await prisma.userDepartment.delete({
      where: {
        userId_departmentId: {
          userId,
          departmentId,
        },
      },
    });
  }

  /**
   * Actualizar el rol de un usuario en un departamento
   * @param {string} departmentId - ID del departamento
   * @param {string} userId - ID del usuario
   * @param {Object} data - Datos a actualizar (role, isPrimary)
   * @returns {Promise<Object>} Asignación actualizada
   */
  async updateUserRole(departmentId, userId, data) {
    const { role, isPrimary } = data;

    // Verificar que la asignación existe
    const assignment = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId,
          departmentId,
        },
      },
    });

    if (!assignment) {
      throw new AppError('El usuario no está asignado a este departamento', 404);
    }

    // Si se cambia a HEAD, verificar que no haya otro HEAD
    if (role === 'HEAD' && assignment.role !== 'HEAD') {
      const existingHead = await prisma.userDepartment.findFirst({
        where: {
          departmentId,
          role: 'HEAD',
        },
      });

      if (existingHead) {
        throw new AppError('El departamento ya tiene un jefe asignado', 400);
      }
    }

    // Si se cambia de HEAD a otro rol, limpiar headUserId
    if (assignment.role === 'HEAD' && role !== 'HEAD') {
      await prisma.department.update({
        where: { id: departmentId },
        data: { headUserId: null },
      });
    }

    // Si se marca como principal, desmarcar otros departamentos principales del usuario
    if (isPrimary && !assignment.isPrimary) {
      await prisma.userDepartment.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    // Actualizar la asignación
    const updated = await prisma.userDepartment.update({
      where: {
        userId_departmentId: {
          userId,
          departmentId,
        },
      },
      data: {
        ...(role && { role }),
        ...(isPrimary !== undefined && { isPrimary }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
          },
        },
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Si el nuevo rol es HEAD, actualizar headUserId
    if (role === 'HEAD') {
      await prisma.department.update({
        where: { id: departmentId },
        data: { headUserId: userId },
      });
    }

    return updated;
  }

  /**
   * Transferir un usuario de un departamento a otro
   * @param {string} fromDepartmentId - ID del departamento origen
   * @param {string} toDepartmentId - ID del departamento destino
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de transferencia (role, isPrimary)
   * @returns {Promise<Object>} Nueva asignación
   */
  async transferUser(fromDepartmentId, toDepartmentId, userId, options = {}) {
    const { role = 'MEMBER', isPrimary = false } = options;

    // Verificar que ambos departamentos existen
    const [fromDept, toDept] = await Promise.all([
      prisma.department.findUnique({ where: { id: fromDepartmentId } }),
      prisma.department.findUnique({ where: { id: toDepartmentId } }),
    ]);

    if (!fromDept) {
      throw new AppError('Departamento origen no encontrado', 404);
    }

    if (!toDept) {
      throw new AppError('Departamento destino no encontrado', 404);
    }

    if (!toDept.isActive) {
      throw new AppError('No se puede transferir a un departamento inactivo', 400);
    }

    // Remover del departamento origen
    await this.removeUser(fromDepartmentId, userId);

    // Asignar al departamento destino
    const newAssignment = await this.assignUser(toDepartmentId, {
      userId,
      role,
      isPrimary,
    });

    return newAssignment;
  }

  /**
   * Listar usuarios de un departamento
   * @param {string} departmentId - ID del departamento
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de usuarios asignados
   */
  async listDepartmentUsers(departmentId, filters = {}) {
    const { role, isPrimary } = filters;

    const where = { departmentId };
    if (role) where.role = role;
    if (isPrimary !== undefined) where.isPrimary = isPrimary;

    const users = await prisma.userDepartment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { assignedAt: 'asc' }],
    });

    return users;
  }

  /**
   * Listar departamentos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de departamentos asignados
   */
  async listUserDepartments(userId) {
    const departments = await prisma.userDepartment.findMany({
      where: { userId },
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            isActive: true,
            parent: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { assignedAt: 'asc' }],
    });

    return departments;
  }
}

export default new UserDepartmentService();
