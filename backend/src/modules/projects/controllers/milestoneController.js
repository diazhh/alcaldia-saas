import * as milestoneService from '../services/milestoneService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea un nuevo hito para un proyecto
 * @route POST /api/projects/:projectId/milestones
 */
export const createMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestone = await milestoneService.createMilestone(projectId, req.body);
    
    return successResponse(res, milestone, 'Hito creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene todos los hitos de un proyecto
 * @route GET /api/projects/:projectId/milestones
 */
export const getMilestonesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestones = await milestoneService.getMilestonesByProject(projectId);
    
    return successResponse(res, milestones, 'Hitos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene un hito por ID
 * @route GET /api/milestones/:id
 */
export const getMilestoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await milestoneService.getMilestoneById(id);
    
    return successResponse(res, milestone, 'Hito obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

/**
 * Actualiza un hito
 * @route PUT /api/milestones/:id
 */
export const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await milestoneService.updateMilestone(id, req.body);
    
    return successResponse(res, milestone, 'Hito actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Elimina un hito
 * @route DELETE /api/milestones/:id
 */
export const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    await milestoneService.deleteMilestone(id);
    
    return successResponse(res, null, 'Hito eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Marca un hito como completado
 * @route POST /api/milestones/:id/complete
 */
export const completeMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await milestoneService.completeMilestone(id);
    
    return successResponse(res, milestone, 'Hito marcado como completado');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Actualiza el progreso de un hito
 * @route PATCH /api/milestones/:id/progress
 */
export const updateMilestoneProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    if (progress === undefined || progress === null) {
      return errorResponse(res, 'El campo progress es requerido', 400);
    }
    
    const milestone = await milestoneService.updateMilestoneProgress(id, progress);
    
    return successResponse(res, milestone, 'Progreso actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
