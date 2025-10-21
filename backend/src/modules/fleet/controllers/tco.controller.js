/**
 * Controlador de TCO (Total Cost of Ownership)
 */

import * as tcoService from '../services/tco.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function calculateVehicleTCO(req, res, next) {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    const tco = await tcoService.calculateVehicleTCO(vehicleId, options);

    return successResponse(res, tco, 'TCO calculado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function calculateFleetTCO(req, res, next) {
  try {
    const { startDate, endDate, type, status } = req.query;

    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (type) options.type = type;
    if (status) options.status = status;

    const tco = await tcoService.calculateFleetTCO(options);

    return successResponse(res, tco, 'TCO de la flota calculado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function compareVehicleTCO(req, res, next) {
  try {
    const { vehicleIds } = req.body;
    const { startDate, endDate } = req.query;

    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs de vehículos',
      });
    }

    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    const comparison = await tcoService.compareVehicleTCO(vehicleIds, options);

    return successResponse(res, comparison, 'Comparación de TCO realizada exitosamente');
  } catch (error) {
    next(error);
  }
}

export {
  calculateVehicleTCO,
  calculateFleetTCO,
  compareVehicleTCO,
};
