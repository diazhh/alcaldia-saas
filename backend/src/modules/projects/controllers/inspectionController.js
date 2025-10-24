import * as inspectionService from '../services/inspectionService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

export const createInspection = async (req, res) => {
  try {
    const inspectorId = req.body.inspectorId || req.user.id;
    const inspection = await inspectionService.createInspection(req.params.projectId, req.body, inspectorId);
    return successResponse(res, inspection, 'Inspección creada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getInspections = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await inspectionService.getInspections(filters, parseInt(page), parseInt(limit));
    return successResponse(res, result, 'Inspecciones obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getInspectionsByProject = async (req, res) => {
  try {
    const inspections = await inspectionService.getInspectionsByProject(req.params.projectId);
    return successResponse(res, inspections, 'Inspecciones del proyecto obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getInspectionById = async (req, res) => {
  try {
    const inspection = await inspectionService.getInspectionById(req.params.id);
    return successResponse(res, inspection, 'Inspección obtenida exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateInspection = async (req, res) => {
  try {
    const inspection = await inspectionService.updateInspection(req.params.id, req.body);
    return successResponse(res, inspection, 'Inspección actualizada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteInspection = async (req, res) => {
  try {
    await inspectionService.deleteInspection(req.params.id);
    return successResponse(res, null, 'Inspección eliminada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const completeInspection = async (req, res) => {
  try {
    const inspection = await inspectionService.completeInspection(req.params.id, req.body);
    return successResponse(res, inspection, 'Inspección completada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getInspectionStats = async (req, res) => {
  try {
    const { projectId } = req.query;
    const stats = await inspectionService.getInspectionStats(projectId);
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
