import jwt from 'jsonwebtoken';

/**
 * Configuración de JWT
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

/**
 * Generar un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Verificar un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload del token
 * @throws {Error} Si el token es inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};
