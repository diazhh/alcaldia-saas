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
 * @param {boolean} rememberMe - Si es true, el token dura 30 días, sino 7 días
 * @returns {string} Token JWT
 */
export const generateToken = (payload, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : jwtConfig.expiresIn;
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn,
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
