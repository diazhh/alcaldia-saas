import * as projectService from '../services/projectService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea un nuevo proyecto
 * @route POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const project = await projectService.createProject(req.body, userId);
    
    return successResponse(res, project, 'Proyecto creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene todos los proyectos con filtros y paginación
 * @route GET /api/projects
 */
export const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sector, category, priority, managerId, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (sector) filters.sector = sector;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (managerId) filters.managerId = managerId;
    if (search) filters.search = search;
    
    const result = await projectService.getProjects(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    return successResponse(res, result, 'Proyectos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene un proyecto por ID
 * @route GET /api/projects/:id
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    
    return successResponse(res, project, 'Proyecto obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

/**
 * Actualiza un proyecto
 * @route PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectService.updateProject(id, req.body);
    
    return successResponse(res, project, 'Proyecto actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Elimina un proyecto
 * @route DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);
    
    return successResponse(res, null, 'Proyecto eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene estadísticas generales de proyectos
 * @route GET /api/projects/stats/general
 */
export const getProjectStats = async (req, res) => {
  try {
    const stats = await projectService.getProjectStats();
    
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
