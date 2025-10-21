import * as payrollService from '../services/payroll.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const result = await payrollService.getAllPayrolls(req.query);
    res.json(successResponse(result.data, 'Nóminas obtenidas exitosamente', result.pagination));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const payroll = await payrollService.getPayrollById(req.params.id);
    res.json(successResponse(payroll, 'Nómina obtenida exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const payroll = await payrollService.createPayroll(req.body);
    res.status(201).json(successResponse(payroll, 'Nómina creada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function calculate(req, res, next) {
  try {
    const payroll = await payrollService.calculatePayroll(req.params.id);
    res.json(successResponse(payroll, 'Nómina calculada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function approve(req, res, next) {
  try {
    const payroll = await payrollService.approvePayroll(req.params.id, req.user.id);
    res.json(successResponse(payroll, 'Nómina aprobada exitosamente'));
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
