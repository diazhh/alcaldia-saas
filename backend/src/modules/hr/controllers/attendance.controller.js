import * as attendanceService from '../services/attendance.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const result = await attendanceService.getAllAttendance(req.query);
    return successResponse(res, result.data, 'Asistencias obtenidas exitosamente', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

async function getByEmployee(req, res, next) {
  try {
    const result = await attendanceService.getAttendanceByEmployee(req.params.employeeId, req.query);
    return successResponse(res, result, 'Asistencias obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const attendance = await attendanceService.createAttendance(req.body);
    return successResponse(res, attendance, 'Asistencia registrada exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function justify(req, res, next) {
  try {
    const { justification } = req.body;
    const attendance = await attendanceService.justifyAttendance(req.params.id, justification, req.user.id);
    return successResponse(res, attendance, 'Asistencia justificada exitosamente');
  } catch (error) {
    next(error);
  }
}

async function generateReport(req, res, next) {
  try {
    const report = await attendanceService.generateAttendanceReport(req.query);
    return successResponse(res, report, 'Reporte generado exitosamente');
  } catch (error) {
    next(error);
  }
}

export { getAll, getByEmployee, create, justify, generateReport };
