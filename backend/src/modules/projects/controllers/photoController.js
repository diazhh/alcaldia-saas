import * as photoService from '../services/photoService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea un nuevo registro de foto para un proyecto
 * @route POST /api/projects/:projectId/photos
 */
export const createPhoto = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // El archivo debe estar en req.file (subido por multer)
    if (!req.file) {
      return errorResponse(res, 'No se ha proporcionado ninguna imagen', 400);
    }
    
    const photoData = {
      url: `/uploads/projects/${req.file.filename}`,
      caption: req.body.caption,
      type: req.body.type || 'DURING',
      takenAt: req.body.takenAt,
    };
    
    const photo = await photoService.createPhoto(projectId, photoData);
    
    return successResponse(res, photo, 'Foto agregada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene todas las fotos de un proyecto
 * @route GET /api/projects/:projectId/photos
 */
export const getPhotosByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query;
    
    const photos = await photoService.getPhotosByProject(projectId, type);
    
    return successResponse(res, photos, 'Fotos obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene una foto por ID
 * @route GET /api/photos/:id
 */
export const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(id);
    
    return successResponse(res, photo, 'Foto obtenida exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

/**
 * Actualiza los datos de una foto
 * @route PUT /api/photos/:id
 */
export const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await photoService.updatePhoto(id, req.body);
    
    return successResponse(res, photo, 'Foto actualizada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Elimina una foto
 * @route DELETE /api/photos/:id
 */
export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    await photoService.deletePhoto(id);
    
    return successResponse(res, null, 'Foto eliminada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene el conteo de fotos por tipo
 * @route GET /api/projects/:projectId/photos/count
 */
export const getPhotoCountByType = async (req, res) => {
  try {
    const { projectId } = req.params;
    const count = await photoService.getPhotoCountByType(projectId);
    
    return successResponse(res, count, 'Conteo obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
