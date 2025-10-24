import * as zoneLayerService from '../services/zoneLayer.service.js';
import { successResponse } from '../../../shared/utils/response.js';

/**
 * Controlador para gestión de capas SIG
 */

/**
 * Obtener todas las capas
 * GET /api/catastro/zone-layers
 */
export async function getAllLayers(req, res, next) {
  try {
    const { layerType, isVisible, page, limit } = req.query;

    const filters = {
      layerType,
      isVisible: isVisible === 'true' ? true : isVisible === 'false' ? false : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };

    const result = await zoneLayerService.getAllLayers(filters);
    return successResponse(res, result, 'Capas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener capa por ID
 * GET /api/catastro/zone-layers/:id
 */
export async function getLayerById(req, res, next) {
  try {
    const { id } = req.params;
    const layer = await zoneLayerService.getLayerById(id);
    return successResponse(res, layer, 'Capa obtenida exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener capas por tipo
 * GET /api/catastro/zone-layers/type/:layerType
 */
export async function getLayersByType(req, res, next) {
  try {
    const { layerType } = req.params;
    const layers = await zoneLayerService.getLayersByType(layerType);
    return successResponse(res, layers, 'Capas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener capas visibles
 * GET /api/catastro/zone-layers/visible
 */
export async function getVisibleLayers(req, res, next) {
  try {
    const layers = await zoneLayerService.getVisibleLayers();
    return successResponse(res, layers, 'Capas visibles obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Crear nueva capa
 * POST /api/catastro/zone-layers
 */
export async function createLayer(req, res, next) {
  try {
    const layer = await zoneLayerService.createLayer(req.body);
    return successResponse(res, layer, 'Capa creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar capa
 * PUT /api/catastro/zone-layers/:id
 */
export async function updateLayer(req, res, next) {
  try {
    const { id } = req.params;
    const layer = await zoneLayerService.updateLayer(id, req.body);
    return successResponse(res, layer, 'Capa actualizada exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar capa
 * DELETE /api/catastro/zone-layers/:id
 */
export async function deleteLayer(req, res, next) {
  try {
    const { id } = req.params;
    const result = await zoneLayerService.deleteLayer(id);
    return successResponse(res, result, 'Capa eliminada exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Alternar visibilidad de capa
 * PATCH /api/catastro/zone-layers/:id/toggle-visibility
 */
export async function toggleVisibility(req, res, next) {
  try {
    const { id } = req.params;
    const layer = await zoneLayerService.toggleLayerVisibility(id);
    return successResponse(res, layer, 'Visibilidad actualizada exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar orden de visualización
 * PATCH /api/catastro/zone-layers/:id/display-order
 */
export async function updateDisplayOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;

    if (typeof displayOrder !== 'number') {
      return res.status(400).json({ error: 'displayOrder debe ser un número' });
    }

    const layer = await zoneLayerService.updateDisplayOrder(id, displayOrder);
    return successResponse(res, layer, 'Orden actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas de capas
 * GET /api/catastro/zone-layers/stats
 */
export async function getStats(req, res, next) {
  try {
    const stats = await zoneLayerService.getLayerStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

export default {
  getAllLayers,
  getLayerById,
  getLayersByType,
  getVisibleLayers,
  createLayer,
  updateLayer,
  deleteLayer,
  toggleVisibility,
  updateDisplayOrder,
  getStats,
};
