/**
 * Controlador para gestión de inspecciones urbanas
 */

import * as urbanInspectionService from '../services/urbanInspection.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import {
  createUrbanInspectionSchema,
  updateUrbanInspectionSchema,
} from '../validations.js';

/**
 * Obtener todas las inspecciones urbanas
 */
export const getAllUrbanInspections = async (req, res, next) => {
  try {
    const result = await urbanInspectionService.getAllUrbanInspections(req.query);
    return successResponse(res, result, 'Inspecciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener inspección por ID
 */
export const getUrbanInspectionById = async (req, res, next) => {
  try {
    const inspection = await urbanInspectionService.getUrbanInspectionById(req.params.id);
    return successResponse(res, inspection, 'Inspección obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener inspección por número
 */
export const getUrbanInspectionByNumber = async (req, res, next) => {
  try {
    const inspection = await urbanInspectionService.getUrbanInspectionByNumber(
      req.params.inspectionNumber
    );
    return successResponse(res, inspection, 'Inspección obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva inspección
 */
export const createUrbanInspection = async (req, res, next) => {
  try {
    const validatedData = createUrbanInspectionSchema.parse(req.body);
    const inspection = await urbanInspectionService.createUrbanInspection(validatedData);
    return successResponse(res, inspection, 'Inspección creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar inspección
 */
export const updateUrbanInspection = async (req, res, next) => {
  try {
    const validatedData = updateUrbanInspectionSchema.parse(req.body);
    const inspection = await urbanInspectionService.updateUrbanInspection(
      req.params.id,
      validatedData
    );
    return successResponse(res, inspection, 'Inspección actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar inspección
 */
export const deleteUrbanInspection = async (req, res, next) => {
  try {
    await urbanInspectionService.deleteUrbanInspection(req.params.id);
    return successResponse(res, null, 'Inspección eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar notificación
 */
export const registerNotification = async (req, res, next) => {
  try {
    const inspection = await urbanInspectionService.registerNotification(
      req.params.id,
      req.body
    );
    return successResponse(res, inspection, 'Notificación registrada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar sanción
 */
export const registerSanction = async (req, res, next) => {
  try {
    const inspection = await urbanInspectionService.registerSanction(
      req.params.id,
      req.body
    );
    return successResponse(res, inspection, 'Sanción registrada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolver inspección
 */
export const resolveInspection = async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;
    const inspection = await urbanInspectionService.resolveInspection(
      req.params.id,
      resolutionNotes
    );
    return successResponse(res, inspection, 'Inspección resuelta exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener inspecciones de una propiedad
 */
export const getInspectionsByProperty = async (req, res, next) => {
  try {
    const inspections = await urbanInspectionService.getInspectionsByProperty(
      req.params.propertyId
    );
    return successResponse(res, inspections, 'Inspecciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas
 */
export const getUrbanInspectionStats = async (req, res, next) => {
  try {
    const stats = await urbanInspectionService.getUrbanInspectionStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};
