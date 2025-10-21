/**
 * Controlador de Control de Combustible
 */

import * as fuelControlService from '../services/fuelControl.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAllFuelControls(req, res, next) {
  try {
    const { page = 1, limit = 10, vehicleId, startDate, endDate } = req.query;

    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await fuelControlService.getAllFuelControls(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return successResponse(res, result.data, 'Registros de combustible obtenidos exitosamente', {
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getFuelControlById(req, res, next) {
  try {
    const { id } = req.params;
    const fuelControl = await fuelControlService.getFuelControlById(id);

    return successResponse(res, fuelControl, 'Registro de combustible obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

async function createFuelControl(req, res, next) {
  try {
    const fuelControl = await fuelControlService.createFuelControl(req.body);

    return successResponse(
      res,
      fuelControl,
      'Registro de combustible creado exitosamente',
      null,
      201
    );
  } catch (error) {
    next(error);
  }
}

async function updateFuelControl(req, res, next) {
  try {
    const { id } = req.params;
    const fuelControl = await fuelControlService.updateFuelControl(id, req.body);

    return successResponse(res, fuelControl, 'Registro de combustible actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function deleteFuelControl(req, res, next) {
  try {
    const { id } = req.params;
    const result = await fuelControlService.deleteFuelControl(id);

    return successResponse(res, result, 'Registro de combustible eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getFuelStatistics(req, res, next) {
  try {
    const { vehicleId, startDate, endDate } = req.query;
    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const statistics = await fuelControlService.getFuelStatistics(filters);

    return successResponse(res, statistics, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getVehicleFuelEfficiency(req, res, next) {
  try {
    const { vehicleId } = req.params;
    const { months = 6 } = req.query;

    const efficiency = await fuelControlService.getVehicleFuelEfficiency(
      vehicleId,
      parseInt(months)
    );

    return successResponse(res, efficiency, 'Rendimiento obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

export {
  getAllFuelControls,
  getFuelControlById,
  createFuelControl,
  updateFuelControl,
  deleteFuelControl,
  getFuelStatistics,
  getVehicleFuelEfficiency,
};
