/**
 * Controlador para Reportes Ciudadanos (Sistema 311)
 */

import * as reportsService from '../services/reports.service.js';
import * as notificationsService from '../services/notifications.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea un nuevo reporte ciudadano
 * POST /api/participation/reports
 */
export async function createReport(req, res) {
  try {
    const data = {
      ...req.body,
      reporterUserId: req.user?.id // Si está autenticado
    };
    
    // TODO: Manejar archivos de fotos con multer
    const files = req.files || [];
    
    const report = await reportsService.createReport(data, files);
    
    // Enviar notificación de recepción
    if (report.reporterEmail) {
      await notificationsService.notifyStatusChange(report.id, 'RECEIVED');
    }
    
    return successResponse(res, report, 'Reporte creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene un reporte por ID
 * GET /api/participation/reports/:id
 */
export async function getReport(req, res) {
  try {
    const { id } = req.params;
    const report = await reportsService.getReportById(id);
    
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene un reporte por número de ticket (público)
 * GET /api/participation/reports/ticket/:ticketNumber
 */
export async function getReportByTicket(req, res) {
  try {
    const { ticketNumber } = req.params;
    const report = await reportsService.getReportByTicket(ticketNumber);
    
    return successResponse(res, report);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Lista reportes con filtros
 * GET /api/participation/reports
 */
export async function listReports(req, res) {
  try {
    const filters = req.query;
    const result = await reportsService.listReports(filters);
    
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Actualiza el estado de un reporte
 * PATCH /api/participation/reports/:id/status
 */
export async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user.id;
    
    const report = await reportsService.updateReportStatus(id, data, userId);
    
    // Enviar notificación de cambio de estado
    if (report.reporterEmail) {
      await notificationsService.notifyStatusChange(report.id, data.status);
    }
    
    return successResponse(res, report, 'Estado actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Asigna un reporte a departamento o usuario
 * PATCH /api/participation/reports/:id/assign
 */
export async function assignReport(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const report = await reportsService.assignReport(id, data);
    
    // Enviar notificación de asignación
    if (report.reporterEmail) {
      await notificationsService.notifyStatusChange(report.id, 'ASSIGNED');
    }
    
    return successResponse(res, report, 'Reporte asignado exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Agrega un comentario a un reporte
 * POST /api/participation/reports/:id/comments
 */
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user?.id;
    
    const comment = await reportsService.addComment(id, data, userId);
    
    // Enviar notificación de nuevo comentario si no es interno
    if (!data.isInternal) {
      const report = await reportsService.getReportById(id);
      if (report.reporterEmail) {
        await notificationsService.notifyNewComment(id, data.comment);
      }
    }
    
    return successResponse(res, comment, 'Comentario agregado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Califica el servicio de un reporte
 * POST /api/participation/reports/:id/rate
 */
export async function rateReport(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const report = await reportsService.rateReport(id, data);
    
    return successResponse(res, report, 'Calificación registrada exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene estadísticas de reportes
 * GET /api/participation/reports/stats
 */
export async function getReportsStats(req, res) {
  try {
    const filters = req.query;
    const stats = await reportsService.getReportsStats(filters);
    
    return successResponse(res, stats);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene datos para mapa de calor
 * GET /api/participation/reports/heatmap
 */
export async function getHeatmapData(req, res) {
  try {
    const filters = req.query;
    const data = await reportsService.getHeatmapData(filters);
    
    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Elimina un reporte (solo SUPER_ADMIN)
 * DELETE /api/participation/reports/:id
 */
export async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    
    await reportsService.deleteReport(id);
    
    return successResponse(res, null, 'Reporte eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}
