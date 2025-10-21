/**
 * Controlador para la gestión de presupuestos
 */

import * as budgetService from '../services/budget.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea un nuevo presupuesto anual
 * @route POST /api/finance/budgets
 */
export const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budget = await budgetService.createBudget(req.body, userId);
    
    return successResponse(res, budget, 'Presupuesto creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene todos los presupuestos
 * @route GET /api/finance/budgets
 */
export const getAllBudgets = async (req, res) => {
  try {
    const { status, year } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (year) filters.year = year;
    
    const budgets = await budgetService.getAllBudgets(filters);
    
    return successResponse(res, budgets, 'Presupuestos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene un presupuesto por año
 * @route GET /api/finance/budgets/year/:year
 */
export const getBudgetByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const budget = await budgetService.getBudgetByYear(year);
    
    return successResponse(res, budget, 'Presupuesto obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Obtiene un presupuesto por ID
 * @route GET /api/finance/budgets/:id
 */
export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetService.getBudgetById(id);
    
    return successResponse(res, budget, 'Presupuesto obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Actualiza un presupuesto
 * @route PUT /api/finance/budgets/:id
 */
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetService.updateBudget(id, req.body);
    
    return successResponse(res, budget, 'Presupuesto actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Aprueba un presupuesto
 * @route POST /api/finance/budgets/:id/approve
 */
export const approveBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const budget = await budgetService.approveBudget(id, userId);
    
    return successResponse(res, budget, 'Presupuesto aprobado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Activa un presupuesto
 * @route POST /api/finance/budgets/:id/activate
 */
export const activateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetService.activateBudget(id);
    
    return successResponse(res, budget, 'Presupuesto activado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Cierra un presupuesto
 * @route POST /api/finance/budgets/:id/close
 */
export const closeBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetService.closeBudget(id);
    
    return successResponse(res, budget, 'Presupuesto cerrado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Elimina un presupuesto
 * @route DELETE /api/finance/budgets/:id
 */
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    await budgetService.deleteBudget(id);
    
    return successResponse(res, null, 'Presupuesto eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene estadísticas de ejecución presupuestaria
 * @route GET /api/finance/budgets/:id/stats
 */
export const getBudgetExecutionStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await budgetService.getBudgetExecutionStats(id);
    
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};
