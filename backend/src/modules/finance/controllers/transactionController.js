/**
 * Controlador para la gestión de transacciones financieras
 */

import * as transactionService from '../services/transaction.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea una nueva transacción (compromiso)
 * @route POST /api/finance/transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transaction = await transactionService.createTransaction(req.body, userId);
    
    return successResponse(res, transaction, 'Transacción creada exitosamente (COMPROMISO)', 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene una transacción por ID
 * @route GET /api/finance/transactions/:id
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(id);
    
    return successResponse(res, transaction, 'Transacción obtenida exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Lista transacciones con filtros y paginación
 * @route GET /api/finance/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const {
      type,
      status,
      budgetItemId,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (budgetItemId) filters.budgetItemId = budgetItemId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (search) filters.search = search;
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    
    const result = await transactionService.getTransactions(filters);
    
    return successResponse(res, result, 'Transacciones obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Causa una transacción (COMPROMISO → CAUSADO)
 * @route POST /api/finance/transactions/:id/accrue
 */
export const accrueTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const transaction = await transactionService.accrueTransaction(id, userId);
    
    return successResponse(res, transaction, 'Transacción causada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Paga una transacción (CAUSADO → PAGADO)
 * @route POST /api/finance/transactions/:id/pay
 */
export const payTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentId } = req.body;
    const userId = req.user.id;
    const transaction = await transactionService.payTransaction(id, userId, paymentId);
    
    return successResponse(res, transaction, 'Transacción pagada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Anula una transacción
 * @route POST /api/finance/transactions/:id/cancel
 */
export const cancelTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const transaction = await transactionService.cancelTransaction(id, userId);
    
    return successResponse(res, transaction, 'Transacción anulada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene estadísticas de transacciones
 * @route GET /api/finance/transactions/stats
 */
export const getTransactionStats = async (req, res) => {
  try {
    const { budgetId, startDate, endDate } = req.query;
    
    const filters = {};
    if (budgetId) filters.budgetId = budgetId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const stats = await transactionService.getTransactionStats(filters);
    
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
