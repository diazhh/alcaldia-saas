/**
 * Utilidades para respuestas HTTP estandarizadas
 */

/**
 * Respuesta exitosa
 * @param {Object} res - Objeto de respuesta de Express
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código de estado HTTP (default: 200)
 * @param {Object} pagination - Información de paginación opcional
 */
export const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  
  if (pagination) {
    response.pagination = pagination;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Respuesta de error
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP (default: 400)
 * @param {*} errors - Errores adicionales
 */
export const errorResponse = (res, message = 'Error en la operación', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  
  return res.status(statusCode).json(response);
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
