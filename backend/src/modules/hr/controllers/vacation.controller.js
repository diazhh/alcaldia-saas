import * as vacationService from '../services/vacation.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const result = await vacationService.getAllVacationRequests(req.query);
    return successResponse(res, result.data, 'Solicitudes obtenidas exitosamente', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

async function getByEmployee(req, res, next) {
  try {
    const requests = await vacationService.getVacationsByEmployee(req.params.employeeId);
    return successResponse(res, requests, 'Solicitudes obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getBalance(req, res, next) {
  try {
    const balance = await vacationService.getVacationBalance(req.params.employeeId);
    return successResponse(res, balance, 'Saldo obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const request = await vacationService.createVacationRequest(req.body);
    return successResponse(res, request, 'Solicitud creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function review(req, res, next) {
  try {
    const { status, reviewComments } = req.body;
    const request = await vacationService.reviewVacationRequest(req.params.id, status, req.user.id, reviewComments);
    return successResponse(res, request, 'Solicitud revisada exitosamente');
  } catch (error) {
    next(error);
  }
}

export { getAll, getByEmployee, getBalance, create, review };
