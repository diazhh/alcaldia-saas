/**
 * Controlador de Vehículos
 * Maneja las peticiones HTTP para la gestión de vehículos
 */

import * as vehicleService from '../services/vehicle.service.js';
import { successResponse } from '../../../shared/utils/response.js';

/**
 * Obtener todos los vehículos
 */
async function getAllVehicles(req, res, next) {
  try {
    const { page = 1, limit = 10, status, type, departmentId, search } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (departmentId) filters.departmentId = departmentId;
    if (search) filters.search = search;

    const result = await vehicleService.getAllVehicles(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return successResponse(res, result.data, 'Vehículos obtenidos exitosamente', {
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener un vehículo por ID
 */
async function getVehicleById(req, res, next) {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);

    return successResponse(res, vehicle, 'Vehículo obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Crear un nuevo vehículo
 */
async function createVehicle(req, res, next) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);

    return successResponse(res, vehicle, 'Vehículo creado exitosamente', null, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar un vehículo
 */
async function updateVehicle(req, res, next) {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.updateVehicle(id, req.body);

    return successResponse(res, vehicle, 'Vehículo actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar un vehículo
 */
async function deleteVehicle(req, res, next) {
  try {
    const { id } = req.params;
    const result = await vehicleService.deleteVehicle(id);

    return successResponse(res, result, 'Vehículo eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas de la flota
 */
async function getFleetStatistics(req, res, next) {
  try {
    const statistics = await vehicleService.getFleetStatistics();

    return successResponse(res, statistics, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar el kilometraje de un vehículo
 */
async function updateMileage(req, res, next) {
  try {
    const { id } = req.params;
    const { mileage } = req.body;

    const vehicle = await vehicleService.updateMileage(id, mileage);

    return successResponse(res, vehicle, 'Kilometraje actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getFleetStatistics,
  updateMileage,
};
