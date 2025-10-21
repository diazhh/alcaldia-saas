/**
 * Controlador de Mantenimiento
 */

import * as maintenanceService from '../services/maintenance.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAllMaintenances(req, res, next) {
  try {
    const { page = 1, limit = 10, vehicleId, type, status, startDate, endDate } = req.query;

    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await maintenanceService.getAllMaintenances(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return successResponse(res, result.data, 'Mantenimientos obtenidos exitosamente', {
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getMaintenanceById(req, res, next) {
  try {
    const { id } = req.params;
    const maintenance = await maintenanceService.getMaintenanceById(id);

    return successResponse(res, maintenance, 'Mantenimiento obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

async function createMaintenance(req, res, next) {
  try {
    const maintenance = await maintenanceService.createMaintenance(req.body);

    return successResponse(res, maintenance, 'Mantenimiento creado exitosamente', null, 201);
  } catch (error) {
    next(error);
  }
}

async function updateMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const maintenance = await maintenanceService.updateMaintenance(id, req.body);

    return successResponse(res, maintenance, 'Mantenimiento actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function deleteMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const result = await maintenanceService.deleteMaintenance(id);

    return successResponse(res, result, 'Mantenimiento eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function completeMaintenance(req, res, next) {
  try {
    const { id } = req.params;
    const maintenance = await maintenanceService.completeMaintenance(id, req.body);

    return successResponse(res, maintenance, 'Mantenimiento completado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getUpcomingMaintenances(req, res, next) {
  try {
    const { daysAhead = 7 } = req.query;
    const maintenances = await maintenanceService.getUpcomingMaintenances(parseInt(daysAhead));

    return successResponse(res, maintenances, 'Mantenimientos próximos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getMaintenanceStatistics(req, res, next) {
  try {
    const { vehicleId, startDate, endDate } = req.query;
    const filters = {};
    if (vehicleId) filters.vehicleId = vehicleId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const statistics = await maintenanceService.getMaintenanceStatistics(filters);

    return successResponse(res, statistics, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getVehicleMaintenanceHistory(req, res, next) {
  try {
    const { vehicleId } = req.params;
    const history = await maintenanceService.getVehicleMaintenanceHistory(vehicleId);

    return successResponse(res, history, 'Historial obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

export {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance,
  getUpcomingMaintenances,
  getMaintenanceStatistics,
  getVehicleMaintenanceHistory,
};
