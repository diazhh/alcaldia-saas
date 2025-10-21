/**
 * Funciones auxiliares generales
 */

/**
 * Sanitizar objeto eliminando campos sensibles
 * @param {Object} obj - Objeto a sanitizar
 * @param {Array<string>} fields - Campos a eliminar
 * @returns {Object} Objeto sanitizado
 */
export const sanitizeObject = (obj, fields = ['password', 'passwordHash']) => {
  const sanitized = { ...obj };
  fields.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
};

/**
 * Generar slug a partir de un texto
 * @param {string} text - Texto a convertir
 * @returns {string} Slug generado
 */
export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generar código aleatorio
 * @param {number} length - Longitud del código
 * @returns {string} Código generado
 */
export const generateRandomCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

/**
 * Formatear fecha a string
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Paginar resultados
 * @param {number} page - Número de página
 * @param {number} limit - Límite por página
 * @returns {Object} Objeto con skip y take para Prisma
 */
export const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

/**
 * Calcular metadata de paginación
 * @param {number} total - Total de registros
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {Object} Metadata de paginación
 */
export const paginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
