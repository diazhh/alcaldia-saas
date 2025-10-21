import * as expenseService from '../services/expenseService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Crea un nuevo gasto para un proyecto
 * @route POST /api/projects/:projectId/expenses
 */
export const createExpense = async (req, res) => {
  try {
    const { projectId } = req.params;
    const expense = await expenseService.createExpense(projectId, req.body);
    
    return successResponse(res, expense, 'Gasto registrado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene todos los gastos de un proyecto
 * @route GET /api/projects/:projectId/expenses
 */
export const getExpensesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const expenses = await expenseService.getExpensesByProject(projectId);
    
    return successResponse(res, expenses, 'Gastos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene un gasto por ID
 * @route GET /api/expenses/:id
 */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await expenseService.getExpenseById(id);
    
    return successResponse(res, expense, 'Gasto obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

/**
 * Actualiza un gasto
 * @route PUT /api/expenses/:id
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await expenseService.updateExpense(id, req.body);
    
    return successResponse(res, expense, 'Gasto actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Elimina un gasto
 * @route DELETE /api/expenses/:id
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await expenseService.deleteExpense(id);
    
    return successResponse(res, null, 'Gasto eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Obtiene estadísticas de gastos de un proyecto
 * @route GET /api/projects/:projectId/expenses/stats
 */
export const getExpenseStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const stats = await expenseService.getExpenseStatsByProject(projectId);
    
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
