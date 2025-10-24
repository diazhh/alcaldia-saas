import * as payrollService from '../services/payroll.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const result = await payrollService.getAllPayrolls(req.query);
    return successResponse(res, result.data, 'Nóminas obtenidas exitosamente', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const payroll = await payrollService.getPayrollById(req.params.id);
    return successResponse(res, payroll, 'Nómina obtenida exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const payroll = await payrollService.createPayroll(req.body);
    return successResponse(res, payroll, 'Nómina creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function calculate(req, res, next) {
  try {
    const payroll = await payrollService.calculatePayroll(req.params.id);
    return successResponse(res, payroll, 'Nómina calculada exitosamente');
  } catch (error) {
    next(error);
  }
}

async function approve(req, res, next) {
  try {
    const payroll = await payrollService.approvePayroll(req.params.id, req.user.id);
    return successResponse(res, payroll, 'Nómina aprobada exitosamente');
  } catch (error) {
    next(error);
  }
}

async function exportPayroll(req, res, next) {
  try {
    const txtContent = await payrollService.exportPayroll(req.params.id);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=nomina-${req.params.id}.txt`);
    res.send(txtContent);
  } catch (error) {
    next(error);
  }
}

export { getAll, getById, create, calculate, approve, exportPayroll };
