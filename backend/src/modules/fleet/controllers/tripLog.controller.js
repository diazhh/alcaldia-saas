/**
 * Controlador de Bitácora de Viajes
 */

import * as tripLogService from '../services/tripLog.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAllTripLogs(req, res, next) {
  try {
    const { page = 1, limit = 10, vehicleId, driverName, startDate, endDate } = req.query;

    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (driverName) filters.driverName = driverName;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await tripLogService.getAllTripLogs(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return successResponse(res, result.data, 'Registros de viaje obtenidos exitosamente', {
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getTripLogById(req, res, next) {
  try {
    const { id } = req.params;
    const tripLog = await tripLogService.getTripLogById(id);

    return successResponse(res, tripLog, 'Registro de viaje obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

async function createTripLog(req, res, next) {
  try {
    const tripLog = await tripLogService.createTripLog(req.body);

    return successResponse(res, tripLog, 'Registro de viaje creado exitosamente', null, 201);
  } catch (error) {
    next(error);
  }
}

async function updateTripLog(req, res, next) {
  try {
    const { id } = req.params;
    const tripLog = await tripLogService.updateTripLog(id, req.body);

    return successResponse(res, tripLog, 'Registro de viaje actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function deleteTripLog(req, res, next) {
  try {
    const { id } = req.params;
    const result = await tripLogService.deleteTripLog(id);

    return successResponse(res, result, 'Registro de viaje eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function finalizeTripLog(req, res, next) {
  try {
    const { id } = req.params;
    const tripLog = await tripLogService.finalizeTripLog(id, req.body);

    return successResponse(res, tripLog, 'Viaje finalizado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getTripStatistics(req, res, next) {
  try {
    const { vehicleId, startDate, endDate } = req.query;
    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const statistics = await tripLogService.getTripStatistics(filters);

    return successResponse(res, statistics, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

export {
  getAllTripLogs,
  getTripLogById,
  createTripLog,
  updateTripLog,
  deleteTripLog,
  finalizeTripLog,
  getTripStatistics,
};
