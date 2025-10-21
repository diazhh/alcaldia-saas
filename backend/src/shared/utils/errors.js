/**
 * Clases de errores personalizadas
 */

/**
 * Error base de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación
 */
export class ValidationError extends AppError {
  constructor(message = 'Error de validación', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Error de autenticación
 */
export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

/**
 * Error de autorización
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
  }
}

/**
 * Error de recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

/**
 * Error de conflicto
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409);
  }
}

/**
 * Error de base de datos
 */
export class DatabaseError extends AppError {
  constructor(message = 'Error en la base de datos') {
    super(message, 500);
  }
}
