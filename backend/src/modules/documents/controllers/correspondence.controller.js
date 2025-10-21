/**
 * Controlador de Correspondencia
 * Maneja las peticiones HTTP para correspondencia
 */

import * as correspondenceService from '../services/correspondence.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import {
  createIncomingCorrespondenceSchema,
  createOutgoingCorrespondenceSchema,
  updateCorrespondenceSchema,
} from '../validations.js';

/**
 * Crear correspondencia de entrada
 * @route POST /api/documents/correspondence/incoming
 */
async function createIncoming(req, res, next) {
  try {
    const validatedData = createIncomingCorrespondenceSchema.parse(req.body);
    const correspondence = await correspondenceService.createIncomingCorrespondence(
      validatedData,
      req.user.id
    );
    
    res.status(201).json(
      successResponse(correspondence, 'Correspondencia de entrada registrada exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Crear correspondencia de salida
 * @route POST /api/documents/correspondence/outgoing
 */
async function createOutgoing(req, res, next) {
  try {
    const validatedData = createOutgoingCorrespondenceSchema.parse(req.body);
    const correspondence = await correspondenceService.createOutgoingCorrespondence(
      validatedData,
      req.user.id
    );
    
    res.status(201).json(
      successResponse(correspondence, 'Correspondencia de salida registrada exitosamente')
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener correspondencia por ID
 * @route GET /api/documents/correspondence/:id
 */
async function getById(req, res, next) {
  try {
    const correspondence = await correspondenceService.getCorrespondenceById(req.params.id);
    res.json(successResponse(correspondence));
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener correspondencia por referencia
 * @route GET /api/documents/correspondence/reference/:reference
 */
async function getByReference(req, res, next) {
  try {
    const correspondence = await correspondenceService.getCorrespondenceByReference(
      req.params.reference
    );
    res.json(successResponse(correspondence));
  } catch (error) {
    next(error);
  }
}

/**
 * Listar correspondencia con filtros
 * @route GET /api/documents/correspondence
 */
async function list(req, res, next) {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      priority: req.query.priority,
      destinationDept: req.query.destinationDept,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    
    const result = await correspondenceService.listCorrespondence(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar correspondencia
 * @route PUT /api/documents/correspondence/:id
 */
async function update(req, res, next) {
  try {
    const validatedData = updateCorrespondenceSchema.parse(req.body);
    const correspondence = await correspondenceService.updateCorrespondence(
      req.params.id,
      validatedData
    );
    
    res.json(successResponse(correspondence, 'Correspondencia actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
}

/**
 * Marcar correspondencia como entregada
 * @route POST /api/documents/correspondence/:id/deliver
 */
async function markAsDelivered(req, res, next) {
  try {
    const correspondence = await correspondenceService.markAsDelivered(
      req.params.id,
      req.body
    );
    
    res.json(successResponse(correspondence, 'Correspondencia marcada como entregada'));
  } catch (error) {
    next(error);
  }
}

/**
 * Marcar correspondencia como despachada
 * @route POST /api/documents/correspondence/:id/dispatch
 */
async function markAsDispatched(req, res, next) {
  try {
    const correspondence = await correspondenceService.markAsDispatched(
      req.params.id,
      req.body
    );
    
    res.json(successResponse(correspondence, 'Correspondencia despachada exitosamente'));
  } catch (error) {
    next(error);
  }
}

/**
 * Archivar correspondencia
 * @route POST /api/documents/correspondence/:id/archive
 */
async function archive(req, res, next) {
  try {
    const correspondence = await correspondenceService.archiveCorrespondence(req.params.id);
    res.json(successResponse(correspondence, 'Correspondencia archivada exitosamente'));
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar correspondencia
 * @route DELETE /api/documents/correspondence/:id
 */
async function remove(req, res, next) {
  try {
    await correspondenceService.deleteCorrespondence(req.params.id);
    res.json(successResponse(null, 'Correspondencia eliminada exitosamente'));
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas de correspondencia
 * @route GET /api/documents/correspondence/stats
 */
async function getStats(req, res, next) {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type,
    };
    
    const stats = await correspondenceService.getCorrespondenceStats(filters);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

/**
 * Rastrear correspondencia
 * @route GET /api/documents/correspondence/track/:identifier
 */
async function track(req, res, next) {
  try {
    const trackingInfo = await correspondenceService.trackCorrespondence(req.params.identifier);
    res.json(successResponse(trackingInfo));
  } catch (error) {
    next(error);
  }
}

export {
  createIncoming,
  createOutgoing,
  getById,
  getByReference,
  list,
  update,
  markAsDelivered,
  markAsDispatched,
  archive,
  remove,
  getStats,
  track,
};
