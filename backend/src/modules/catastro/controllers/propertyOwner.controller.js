/**
 * Controlador para gestión de propietarios de inmuebles
 */

import * as propertyOwnerService from '../services/propertyOwner.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { createPropertyOwnerSchema } from '../validations.js';

/**
 * Obtener propietarios de una propiedad
 */
export const getPropertyOwners = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const owners = await propertyOwnerService.getPropertyOwners(propertyId);
    return successResponse(res, owners, 'Propietarios obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener propietario actual de una propiedad
 */
export const getCurrentOwner = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const owner = await propertyOwnerService.getCurrentOwner(propertyId);
    return successResponse(res, owner, 'Propietario actual obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nuevo propietario
 */
export const createPropertyOwner = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const validatedData = createPropertyOwnerSchema.parse(req.body);
    const owner = await propertyOwnerService.createPropertyOwner({
      ...validatedData,
      propertyId,
    });
    return successResponse(res, owner, 'Propietario creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener propiedades de un contribuyente
 */
export const getPropertiesByOwner = async (req, res, next) => {
  try {
    const { taxpayerId } = req.params;
    const properties = await propertyOwnerService.getPropertiesByOwner(taxpayerId);
    return successResponse(res, properties, 'Propiedades obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};
