import userDepartmentService from './user-department.service.js';
import { assignUserSchema, updateUserRoleSchema } from './department.validation.js';
import { AppError } from '../../shared/utils/errors.js';

/**
 * Controlador para gestión de asignación de usuarios a departamentos
 */
class UserDepartmentController {
  /**
   * Asignar un usuario a un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async assignUser(req, res, next) {
    try {
      const { departmentId } = req.params;
      const validatedData = assignUserSchema.parse(req.body);

      const assignment = await userDepartmentService.assignUser(departmentId, validatedData);

      res.status(201).json({
        success: true,
        message: 'Usuario asignado al departamento exitosamente',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remover un usuario de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async removeUser(req, res, next) {
    try {
      const { departmentId, userId } = req.params;

      await userDepartmentService.removeUser(departmentId, userId);

      res.json({
        success: true,
        message: 'Usuario removido del departamento exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar rol de un usuario en un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async updateUserRole(req, res, next) {
    try {
      const { departmentId, userId } = req.params;
      const validatedData = updateUserRoleSchema.parse(req.body);

      const updated = await userDepartmentService.updateUserRole(departmentId, userId, validatedData);

      res.json({
        success: true,
        message: 'Rol del usuario actualizado exitosamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transferir un usuario entre departamentos
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async transferUser(req, res, next) {
    try {
      const { departmentId, userId } = req.params;
      const { toDepartmentId, role, isPrimary } = req.body;

      if (!toDepartmentId) {
        throw new AppError('El ID del departamento destino es requerido', 400);
      }

      const newAssignment = await userDepartmentService.transferUser(
        departmentId,
        toDepartmentId,
        userId,
        { role, isPrimary }
      );

      res.json({
        success: true,
        message: 'Usuario transferido exitosamente',
        data: newAssignment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar usuarios de un departamento
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listDepartmentUsers(req, res, next) {
    try {
      const { departmentId } = req.params;
      const { role, isPrimary } = req.query;

      const users = await userDepartmentService.listDepartmentUsers(departmentId, {
        role,
        isPrimary: isPrimary !== undefined ? isPrimary === 'true' : undefined,
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar departamentos de un usuario
   * @param {Request} req - Request de Express
   * @param {Response} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listUserDepartments(req, res, next) {
    try {
      const { userId } = req.params;

      const departments = await userDepartmentService.listUserDepartments(userId);

      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserDepartmentController();
