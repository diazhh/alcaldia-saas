/**
 * Controlador para Portal de Transparencia
 */

import * as transparencyService from '../services/transparency.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Publica un documento de transparencia
 * POST /api/participation/transparency/documents
 */
export async function publishDocument(req, res) {
  try {
    const data = req.body;
    const userId = req.user.id;
    
    const document = await transparencyService.publishDocument(data, userId);
    
    return successResponse(res, document, 'Documento publicado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene un documento por ID
 * GET /api/participation/transparency/documents/:id
 */
export async function getDocument(req, res) {
  try {
    const { id } = req.params;
    const document = await transparencyService.getDocumentById(id);
    
    // Registrar visualización
    await transparencyService.registerView(id);
    
    return successResponse(res, document);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Lista documentos con filtros
 * GET /api/participation/transparency/documents
 */
export async function listDocuments(req, res) {
  try {
    const filters = req.query;
    const result = await transparencyService.listDocuments(filters);
    
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Actualiza un documento
 * PUT /api/participation/transparency/documents/:id
 */
export async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const document = await transparencyService.updateDocument(id, data);
    
    return successResponse(res, document, 'Documento actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Elimina (desactiva) un documento
 * DELETE /api/participation/transparency/documents/:id
 */
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    
    await transparencyService.deleteDocument(id);
    
    return successResponse(res, null, 'Documento eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Registra una descarga de documento
 * POST /api/participation/transparency/documents/:id/download
 */
export async function registerDownload(req, res) {
  try {
    const { id } = req.params;
    
    await transparencyService.registerDownload(id);
    
    return successResponse(res, null, 'Descarga registrada');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene documentos por categoría
 * GET /api/participation/transparency/categories/:category/documents
 */
export async function getDocumentsByCategory(req, res) {
  try {
    const { category } = req.params;
    const documents = await transparencyService.getDocumentsByCategory(category);
    
    return successResponse(res, documents);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene documentos más descargados
 * GET /api/participation/transparency/documents/most-downloaded
 */
export async function getMostDownloaded(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const documents = await transparencyService.getMostDownloaded(limit);
    
    return successResponse(res, documents);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene documentos más vistos
 * GET /api/participation/transparency/documents/most-viewed
 */
export async function getMostViewed(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const documents = await transparencyService.getMostViewed(limit);
    
    return successResponse(res, documents);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene estadísticas del portal
 * GET /api/participation/transparency/stats
 */
export async function getTransparencyStats(req, res) {
  try {
    const stats = await transparencyService.getTransparencyStats();
    
    return successResponse(res, stats);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Busca documentos por texto
 * GET /api/participation/transparency/search
 */
export async function searchDocuments(req, res) {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return errorResponse(res, { message: 'Parámetro de búsqueda requerido' }, 400);
    }
    
    const documents = await transparencyService.searchDocuments(q, parseInt(limit) || 20);
    
    return successResponse(res, documents);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene años disponibles
 * GET /api/participation/transparency/years
 */
export async function getAvailableYears(req, res) {
  try {
    const years = await transparencyService.getAvailableYears();
    
    return successResponse(res, years);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene categorías con conteo
 * GET /api/participation/transparency/categories
 */
export async function getCategoriesWithCount(req, res) {
  try {
    const categories = await transparencyService.getCategoriesWithCount();
    
    return successResponse(res, categories);
  } catch (error) {
    return errorResponse(res, error);
  }
}
