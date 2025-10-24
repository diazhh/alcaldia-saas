import * as progressReportService from '../services/progressReportService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

export const createProgressReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const report = await progressReportService.createProgressReport(req.params.projectId, req.body, userId);
    return successResponse(res, report, 'Reporte de avance creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getReportsByProject = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await progressReportService.getReportsByProject(req.params.projectId, parseInt(page), parseInt(limit));
    return successResponse(res, result, 'Reportes obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await progressReportService.getReportById(req.params.id);
    return successResponse(res, report, 'Reporte obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateProgressReport = async (req, res) => {
  try {
    const report = await progressReportService.updateProgressReport(req.params.id, req.body);
    return successResponse(res, report, 'Reporte actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteProgressReport = async (req, res) => {
  try {
    await progressReportService.deleteProgressReport(req.params.id);
    return successResponse(res, null, 'Reporte eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getLatestReport = async (req, res) => {
  try {
    const report = await progressReportService.getLatestReport(req.params.projectId);
    return successResponse(res, report, 'Último reporte obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getReportStats = async (req, res) => {
  try {
    const stats = await progressReportService.getReportStats(req.params.projectId);
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
