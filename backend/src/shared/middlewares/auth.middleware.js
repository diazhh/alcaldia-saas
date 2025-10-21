import { verifyToken } from '../../config/jwt.js';
import prisma from '../../config/database.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { hasPermission, hasModuleAccess } from '../constants/permissions.js';
import { logAccessDenied } from '../utils/access-logger.js';

/**
 * Middleware para autenticar usuario mediante JWT
 * Verifica el token y adjunta el usuario a req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token no proporcionado');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Usuario inactivo');
    }

    // Adjuntar usuario al request
    req.user = user;

    next();
  } catch (error) {
    if (error.message === 'Token inválido o expirado') {
      next(new AuthenticationError('Token inválido o expirado'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware para autorizar por roles
 * @param {...string} allowedRoles - Roles permitidos
 * @returns {Function} Middleware de Express
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuario no autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Middleware para verificar permisos granulares
 * @param {string} module - Módulo a verificar
 * @param {string} action - Acción a verificar
 * @returns {Function} Middleware de Express
 */
export const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuario no autenticado'));
    }

    const userRole = req.user.role;
    
    if (!hasPermission(userRole, module, action)) {
      // Registrar intento de acceso denegado
      logAccessDenied({
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        module,
        action,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method,
      });
      
      return next(
        new AuthorizationError(
          `Acceso denegado. No tiene permisos para realizar la acción '${action}' en el módulo '${module}'`
        )
      );
    }

    next();
  };
};

/**
 * Middleware para verificar acceso a un módulo
 * @param {string} module - Módulo a verificar
 * @returns {Function} Middleware de Express
 */
export const requireModuleAccess = (module) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuario no autenticado'));
    }

    const userRole = req.user.role;
    
    if (!hasModuleAccess(userRole, module)) {
      // Registrar intento de acceso denegado
      logAccessDenied({
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        module,
        action: 'access',
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method,
      });
      
      return next(
        new AuthorizationError(
          `Acceso denegado. No tiene permisos para acceder al módulo '${module}'`
        )
      );
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Si hay token, lo verifica y adjunta el usuario
 * Si no hay token, continúa sin error
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Si hay error en el token opcional, simplemente continuar sin usuario
    next();
  }
};
