import * as severanceService from '../services/severance.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getByEmployee(req, res, next) {
  try {
    const result = await severanceService.getSeveranceByEmployee(req.params.employeeId);
    res.json(successResponse(result, 'Prestaciones obtenidas exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function calculateMonthly(req, res, next) {
  try {
    const { year, month } = req.body;
    const result = await severanceService.calculateMonthlySeverance(year, month);
    res.json(successResponse(result, 'Prestaciones calculadas exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function liquidate(req, res, next) {
  try {
    const result = await severanceService.liquidateSeverance(req.params.employeeId);
    res.json(successResponse(result, 'Liquidación realizada exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getByEmployee, calculateMonthly, liquidate };
