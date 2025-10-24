import authService from '../services/auth.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { SUCCESS_MESSAGES } from '../../../shared/constants/index.js';

/**
 * Controlador de Autenticación
 */
class AuthController {
  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      return successResponse(res, result, SUCCESS_MESSAGES.REGISTER_SUCCESS, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      return successResponse(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);

      return successResponse(res, user, 'Perfil obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);

      return successResponse(res, user, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar contraseña
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

      return successResponse(res, result, 'Contraseña actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar token (me)
   * GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      const user = await authService.verifyUser(req.user.id);

      return successResponse(res, user, 'Usuario verificado');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // En JWT stateless, el logout se maneja en el cliente eliminando el token
      // Aquí podríamos agregar lógica de blacklist si fuera necesario
      return successResponse(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos los usuarios
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      return successResponse(res, users, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
