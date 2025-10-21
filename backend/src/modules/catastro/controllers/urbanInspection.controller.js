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
    res.json(successResponse(result, 'Inspecciones obtenidas exitosamente'));
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
    res.json(successResponse(inspection, 'Inspección obtenida exitosamente'));
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
    res.json(successResponse(inspection, 'Inspección obtenida exitosamente'));
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
    res.status(201).json(successResponse(inspection, 'Inspección creada exitosamente'));
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
    res.json(successResponse(inspection, 'Inspección actualizada exitosamente'));
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
    res.json(successResponse(null, 'Inspección eliminada exitosamente'));
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
    res.json(successResponse(inspection, 'Notificación registrada exitosamente'));
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
    res.json(successResponse(inspection, 'Sanción registrada exitosamente'));
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
    res.json(successResponse(inspection, 'Inspección resuelta exitosamente'));
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
    res.json(successResponse(inspections, 'Inspecciones obtenidas exitosamente'));
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
    res.json(successResponse(stats, 'Estadísticas obtenidas exitosamente'));
  } catch (error) {
    next(error);
  }
};
