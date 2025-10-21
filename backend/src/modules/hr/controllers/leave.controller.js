import * as leaveService from '../services/leave.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const result = await leaveService.getAllLeaves(req.query);
    res.json(successResponse(result.data, 'Permisos obtenidos exitosamente', result.pagination));
  } catch (error) {
    next(error);
  }
}

async function getByEmployee(req, res, next) {
  try {
    const leaves = await leaveService.getLeavesByEmployee(req.params.employeeId);
    res.json(successResponse(leaves, 'Permisos obtenidos exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const leave = await leaveService.createLeave(req.body);
    res.status(201).json(successResponse(leave, 'Permiso creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function review(req, res, next) {
  try {
    const { status, reviewComments } = req.body;
    const leave = await leaveService.reviewLeave(req.params.id, status, req.user.id, reviewComments);
    res.json(successResponse(leave, 'Permiso revisado exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getAll, getByEmployee, create, review };
