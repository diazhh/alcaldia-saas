/**
 * Controlador de empleados
 */

import * as employeeService from '../services/employee.service.js';
import { successResponse } from '../../../shared/utils/response.js';

/**
 * Obtener todos los empleados
 */
async function getAll(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      departmentId: req.query.departmentId,
      positionId: req.query.positionId,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };
    
    const result = await employeeService.getAllEmployees(filters);
    
    return successResponse(res, result.data, 'Empleados obtenidos exitosamente', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener un empleado por ID
 */
async function getById(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return successResponse(res, employee, 'Empleado obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener expediente completo de un empleado
 */
async function getFullProfile(req, res, next) {
  try {
    const profile = await employeeService.getFullProfile(req.params.id);
    return successResponse(res, profile, 'Expediente obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Crear un nuevo empleado
 */
async function create(req, res, next) {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return successResponse(res, employee, 'Empleado creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar un empleado
 */
async function update(req, res, next) {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    return successResponse(res, employee, 'Empleado actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar estado de un empleado
 */
async function updateStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    const employee = await employeeService.updateEmployeeStatus(req.params.id, status, reason);
    return successResponse(res, employee, 'Estado actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar un empleado
 */
async function deleteEmployee(req, res, next) {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    return successResponse(res, employee, 'Empleado eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas de empleados
 */
async function getStats(req, res, next) {
  try {
    const stats = await employeeService.getEmployeeStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

export {
  getAll,
  getById,
  getFullProfile,
  create,
  update,
  updateStatus,
  deleteEmployee as delete,
  getStats,
};
