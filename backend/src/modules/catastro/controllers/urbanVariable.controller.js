/**
 * Controlador para gestión de variables urbanas
 */

import * as urbanVariableService from '../services/urbanVariable.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import {
  createUrbanVariableSchema,
  updateUrbanVariableSchema,
} from '../validations.js';

/**
 * Obtener todas las variables urbanas
 */
export const getAllUrbanVariables = async (req, res, next) => {
  try {
    const variables = await urbanVariableService.getAllUrbanVariables(req.query);
    return successResponse(res, variables, 'Variables urbanas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener variable urbana por ID
 */
export const getUrbanVariableById = async (req, res, next) => {
  try {
    const variable = await urbanVariableService.getUrbanVariableById(req.params.id);
    return successResponse(res, variable, 'Variable urbana obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener variable urbana por código de zona
 */
export const getUrbanVariableByZoneCode = async (req, res, next) => {
  try {
    const variable = await urbanVariableService.getUrbanVariableByZoneCode(
      req.params.zoneCode
    );
    return successResponse(res, variable, 'Variable urbana obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva variable urbana
 */
export const createUrbanVariable = async (req, res, next) => {
  try {
    const validatedData = createUrbanVariableSchema.parse(req.body);
    const variable = await urbanVariableService.createUrbanVariable(validatedData);
    res
      .status(201)
      .json(successResponse(variable, 'Variable urbana creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar variable urbana
 */
export const updateUrbanVariable = async (req, res, next) => {
  try {
    const validatedData = updateUrbanVariableSchema.parse(req.body);
    const variable = await urbanVariableService.updateUrbanVariable(
      req.params.id,
      validatedData
    );
    return successResponse(res, variable, 'Variable urbana actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar variable urbana
 */
export const deleteUrbanVariable = async (req, res, next) => {
  try {
    await urbanVariableService.deleteUrbanVariable(req.params.id);
    return successResponse(res, null, 'Variable urbana eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Verificar cumplimiento de variables urbanas
 */
export const checkCompliance = async (req, res, next) => {
  try {
    const { zoneCode } = req.params;
    const projectData = req.body;
    const result = await urbanVariableService.checkCompliance(zoneCode, projectData);
    return successResponse(res, result, 'Verificación completada');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de zonas
 */
export const getZoneStats = async (req, res, next) => {
  try {
    const stats = await urbanVariableService.getZoneStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};
