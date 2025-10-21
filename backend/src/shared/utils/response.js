/**
 * Utilidades para respuestas HTTP estandarizadas
 */

/**
 * Respuesta exitosa
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje opcional
 * @param {Object} pagination - Información de paginación opcional
 */
export const successResponse = (data, message = 'Operación exitosa', pagination = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  
  if (pagination) {
    response.pagination = pagination;
  }
  
  return response;
};

/**
 * Respuesta de error
 * @param {string} message - Mensaje de error
 * @param {*} errors - Errores adicionales
 */
export const errorResponse = (message = 'Error en la operación', errors = null) => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
};

/**
 * Respuesta de validación fallida
 * @param {Array} errors - Array de errores de validación
 */
export const validationErrorResponse = (errors) => {
  return {
    success: false,
    message: 'Error de validación',
    errors,
  };
};

/**
 * Respuesta de no autorizado
 * @param {string} message - Mensaje de error
 */
export const unauthorizedResponse = (message = 'No autorizado') => {
  return {
    success: false,
    message,
  };
};

/**
 * Respuesta de prohibido
 * @param {string} message - Mensaje de error
 */
export const forbiddenResponse = (message = 'Acceso prohibido') => {
  return {
    success: false,
    message,
  };
};

/**
 * Respuesta de no encontrado
 * @param {string} message - Mensaje de error
 */
export const notFoundResponse = (message = 'Recurso no encontrado') => {
  return {
    success: false,
    message,
  };
};
