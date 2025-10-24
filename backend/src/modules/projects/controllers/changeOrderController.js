import * as changeOrderService from '../services/changeOrderService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

export const createChangeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await changeOrderService.createChangeOrder(req.params.projectId, req.body, userId);
    return successResponse(res, order, 'Orden de cambio creada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getChangeOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await changeOrderService.getChangeOrders(filters, parseInt(page), parseInt(limit));
    return successResponse(res, result, 'Órdenes de cambio obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getChangeOrdersByProject = async (req, res) => {
  try {
    const orders = await changeOrderService.getChangeOrdersByProject(req.params.projectId);
    return successResponse(res, orders, 'Órdenes de cambio del proyecto obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getChangeOrderById = async (req, res) => {
  try {
    const order = await changeOrderService.getChangeOrderById(req.params.id);
    return successResponse(res, order, 'Orden de cambio obtenida exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateChangeOrder = async (req, res) => {
  try {
    const order = await changeOrderService.updateChangeOrder(req.params.id, req.body);
    return successResponse(res, order, 'Orden de cambio actualizada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteChangeOrder = async (req, res) => {
  try {
    await changeOrderService.deleteChangeOrder(req.params.id);
    return successResponse(res, null, 'Orden de cambio eliminada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const reviewChangeOrder = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { reviewNotes } = req.body;
    const order = await changeOrderService.reviewChangeOrder(req.params.id, reviewerId, reviewNotes);
    return successResponse(res, order, 'Orden de cambio revisada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const approveChangeOrder = async (req, res) => {
  try {
    const approverId = req.user.id;
    const order = await changeOrderService.approveChangeOrder(req.params.id, approverId);
    return successResponse(res, order, 'Orden de cambio aprobada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const rejectChangeOrder = async (req, res) => {
  try {
    const approverId = req.user.id;
    const { rejectionReason } = req.body;
    const order = await changeOrderService.rejectChangeOrder(req.params.id, approverId, rejectionReason);
    return successResponse(res, order, 'Orden de cambio rechazada');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const implementChangeOrder = async (req, res) => {
  try {
    const order = await changeOrderService.implementChangeOrder(req.params.id);
    return successResponse(res, order, 'Orden de cambio implementada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getChangeOrderStats = async (req, res) => {
  try {
    const { projectId } = req.query;
    const stats = await changeOrderService.getChangeOrderStats(projectId);
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
