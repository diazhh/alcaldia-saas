/**
 * Controlador para gestión de fichas catastrales (propiedades)
 */

import * as propertyService from '../services/property.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { createPropertySchema, updatePropertySchema } from '../validations.js';

/**
 * Obtener todas las propiedades
 */
export const getAllProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getAllProperties(req.query);
    return successResponse(res, result, 'Propiedades obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener propiedad por ID
 */
export const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    return successResponse(res, property, 'Propiedad obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener propiedad por código catastral
 */
export const getPropertyByCadastralCode = async (req, res, next) => {
  try {
    const property = await propertyService.getPropertyByCadastralCode(
      req.params.cadastralCode
    );
    return successResponse(res, property, 'Propiedad obtenida exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva propiedad
 */
export const createProperty = async (req, res, next) => {
  try {
    const validatedData = createPropertySchema.parse(req.body);
    const property = await propertyService.createProperty(validatedData);
    return successResponse(res, property, 'Propiedad creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar propiedad
 */
export const updateProperty = async (req, res, next) => {
  try {
    const validatedData = updatePropertySchema.parse(req.body);
    const property = await propertyService.updateProperty(req.params.id, validatedData);
    return successResponse(res, property, 'Propiedad actualizada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar propiedad
 */
export const deleteProperty = async (req, res, next) => {
  try {
    await propertyService.deleteProperty(req.params.id);
    return successResponse(res, null, 'Propiedad eliminada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar propiedades por ubicación
 */
export const searchPropertiesByLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const properties = await propertyService.searchPropertiesByLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius) || 1
    );
    return successResponse(res, properties, 'Propiedades encontradas');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de propiedades
 */
export const getPropertyStats = async (req, res, next) => {
  try {
    const stats = await propertyService.getPropertyStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};
