import customRolesService from './custom-roles.service.js';
import { successResponse } from '../../shared/utils/response.js';

/**
 * Controlador de Roles Personalizados
 */
class CustomRolesController {
  /**
   * Obtener todos los roles personalizados
   */
  async getAllRoles(req, res, next) {
    try {
      const roles = await customRolesService.getAllRoles();
      return successResponse(res, roles, 'Roles obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener un rol por ID
   */
  async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      const role = await customRolesService.getRoleById(id);
      return successResponse(res, role, 'Rol obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear un nuevo rol personalizado
   */
  async createRole(req, res, next) {
    try {
      const roleData = req.body;
      const createdBy = req.user.id;
      const role = await customRolesService.createRole(roleData, createdBy);
      return successResponse(res, role, 'Rol creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un rol personalizado
   */
  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const roleData = req.body;
      const role = await customRolesService.updateRole(id, roleData);
      return successResponse(res, role, 'Rol actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un rol personalizado
   */
  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      await customRolesService.deleteRole(id);
      return successResponse(res, null, 'Rol eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;
      const role = await customRolesService.assignPermissions(id, permissionIds);
      return successResponse(res, role, 'Permisos asignados exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuarios asignados a un rol
   */
  async getRoleUsers(req, res, next) {
    try {
      const { id } = req.params;
      const users = await customRolesService.getRoleUsers(id);
      return successResponse(res, users, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar rol a un usuario
   */
  async assignRoleToUser(req, res, next) {
    try {
      const { roleId, userId } = req.body;
      const assignedBy = req.user.id;
      const assignment = await customRolesService.assignRoleToUser(
        roleId,
        userId,
        assignedBy
      );
      return successResponse(res, assignment, 'Rol asignado al usuario exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remover rol de un usuario
   */
  async removeRoleFromUser(req, res, next) {
    try {
      const { roleId, userId } = req.body;
      await customRolesService.removeRoleFromUser(roleId, userId);
      return successResponse(res, null, 'Rol removido del usuario exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomRolesController();
