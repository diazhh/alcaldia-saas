import { ValidationError } from '../utils/errors.js';

/**
 * Middleware para validar datos con Zod
 * @param {import('zod').ZodSchema} schema - Schema de Zod
 * @returns {Function} Middleware de Express
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new ValidationError('Error de validación', errors));
    }
  };
};

/**
 * Middleware para validar query params
 * @param {import('zod').ZodSchema} schema - Schema de Zod
 * @returns {Function} Middleware de Express
 */
export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new ValidationError('Error de validación en query params', errors));
    }
  };
};

/**
 * Middleware para validar params
 * @param {import('zod').ZodSchema} schema - Schema de Zod
 * @returns {Function} Middleware de Express
 */
export const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new ValidationError('Error de validación en params', errors));
    }
  };
};
