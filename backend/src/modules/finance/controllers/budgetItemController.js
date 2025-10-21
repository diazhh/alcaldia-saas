/**
 * Controlador para la gestión de partidas presupuestarias
 */

import * as budgetItemService from '../services/budgetItem.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea una nueva partida presupuestaria
 * @route POST /api/finance/budget-items
 */
export const createBudgetItem = async (req, res) => {
  try {
    const budgetItem = await budgetItemService.createBudgetItem(req.body);
    
    return successResponse(res, budgetItem, 'Partida presupuestaria creada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene una partida presupuestaria por ID
 * @route GET /api/finance/budget-items/:id
 */
export const getBudgetItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const budgetItem = await budgetItemService.getBudgetItemById(id);
    
    return successResponse(res, budgetItem, 'Partida presupuestaria obtenida exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Lista todas las partidas de un presupuesto
 * @route GET /api/finance/budgets/:budgetId/items
 */
export const getBudgetItems = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { departmentId, category, search } = req.query;
    
    const filters = {};
    if (departmentId) filters.departmentId = departmentId;
    if (category) filters.category = category;
    if (search) filters.search = search;
    
    const budgetItems = await budgetItemService.getBudgetItems(budgetId, filters);
    
    return successResponse(res, budgetItems, 'Partidas presupuestarias obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Actualiza una partida presupuestaria
 * @route PUT /api/finance/budget-items/:id
 */
export const updateBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    const budgetItem = await budgetItemService.updateBudgetItem(id, req.body);
    
    return successResponse(res, budgetItem, 'Partida presupuestaria actualizada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Elimina una partida presupuestaria
 * @route DELETE /api/finance/budget-items/:id
 */
export const deleteBudgetItem = async (req, res) => {
  try {
    const { id } = req.params;
    await budgetItemService.deleteBudgetItem(id);
    
    return successResponse(res, null, 'Partida presupuestaria eliminada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Verifica la disponibilidad presupuestaria
 * @route POST /api/finance/budget-items/check-availability
 */
export const checkBudgetAvailability = async (req, res) => {
  try {
    const { budgetItemId, amount } = req.body;
    const result = await budgetItemService.checkBudgetAvailability(budgetItemId, amount);
    
    return successResponse(res, result, 'Disponibilidad verificada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene el resumen de ejecución por categoría
 * @route GET /api/finance/budgets/:budgetId/items/by-category
 */
export const getBudgetItemsByCategory = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const summary = await budgetItemService.getBudgetItemsByCategory(budgetId);
    
    return successResponse(res, summary, 'Resumen por categoría obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
