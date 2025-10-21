import bcrypt from 'bcrypt';
import prisma from '../../../config/database.js';
import { generateToken } from '../../../config/jwt.js';
import { sanitizeObject } from '../../../shared/utils/helpers.js';
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
} from '../../../shared/utils/errors.js';

/**
 * Servicio de Autenticación
 */
class AuthService {
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado y token
   */
  async register(userData) {
    const { email, password, firstName, lastName, phone } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'EMPLEADO', // Rol por defecto
      },
    });

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Sanitizar usuario (eliminar password)
    const sanitizedUser = sanitizeObject(user);

    return {
      user: sanitizedUser,
      token,
    };
  }

  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales del usuario
   * @returns {Promise<Object>} Usuario y token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new AuthenticationError('Usuario inactivo. Contacte al administrador');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Sanitizar usuario
    const sanitizedUser = sanitizeObject(user);

    return {
      user: sanitizedUser,
      token,
    };
  }

  /**
   * Obtener perfil del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Usuario
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return sanitizeObject(user);
  }

  /**
   * Actualizar perfil del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateProfile(userId, updateData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return sanitizeObject(updatedUser);
  }

  /**
   * Cambiar contraseña
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Mensaje de éxito
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Verificar token y obtener usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Usuario
   */
  async verifyUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Usuario inactivo');
    }

    return sanitizeObject(user);
  }
}

export default new AuthService();
