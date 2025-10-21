import * as vacationService from '../services/vacation.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const result = await vacationService.getAllVacationRequests(req.query);
    res.json(successResponse(result.data, 'Solicitudes obtenidas exitosamente', result.pagination));
  } catch (error) {
    next(error);
  }
}

async function getByEmployee(req, res, next) {
  try {
    const requests = await vacationService.getVacationsByEmployee(req.params.employeeId);
    res.json(successResponse(requests, 'Solicitudes obtenidas exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getBalance(req, res, next) {
  try {
    const balance = await vacationService.getVacationBalance(req.params.employeeId);
    res.json(successResponse(balance, 'Saldo obtenido exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const request = await vacationService.createVacationRequest(req.body);
    res.status(201).json(successResponse(request, 'Solicitud creada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function review(req, res, next) {
  try {
    const { status, reviewComments } = req.body;
    const request = await vacationService.reviewVacationRequest(req.params.id, status, req.user.id, reviewComments);
    res.json(successResponse(request, 'Solicitud revisada exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getAll, getByEmployee, getBalance, create, review };
