/**
 * Controlador para Presupuesto Participativo
 */

import * as budgetService from '../services/participatory-budget.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

// ============================================
// CONVOCATORIAS
// ============================================

/**
 * Crea una nueva convocatoria
 * POST /api/participation/participatory-budgets
 */
export async function createParticipatoryBudget(req, res) {
  try {
    const data = req.body;
    const userId = req.user.id;
    
    const budget = await budgetService.createParticipatoryBudget(data, userId);
    
    return successResponse(res, budget, 'Convocatoria creada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene una convocatoria por ID
 * GET /api/participation/participatory-budgets/:id
 */
export async function getParticipatoryBudget(req, res) {
  try {
    const { id } = req.params;
    const budget = await budgetService.getParticipatoryBudgetById(id);
    
    return successResponse(res, budget);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Lista convocatorias
 * GET /api/participation/participatory-budgets
 */
export async function listParticipatoryBudgets(req, res) {
  try {
    const filters = req.query;
    const result = await budgetService.listParticipatoryBudgets(filters);
    
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Actualiza una convocatoria
 * PUT /api/participation/participatory-budgets/:id
 */
export async function updateParticipatoryBudget(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const budget = await budgetService.updateParticipatoryBudget(id, data);
    
    return successResponse(res, budget, 'Convocatoria actualizada exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Elimina una convocatoria
 * DELETE /api/participation/participatory-budgets/:id
 */
export async function deleteParticipatoryBudget(req, res) {
  try {
    const { id } = req.params;
    
    await budgetService.deleteParticipatoryBudget(id);
    
    return successResponse(res, null, 'Convocatoria eliminada exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

// ============================================
// PROPUESTAS
// ============================================

/**
 * Crea una nueva propuesta
 * POST /api/participation/participatory-budgets/:budgetId/proposals
 */
export async function createProposal(req, res) {
  try {
    const { budgetId } = req.params;
    const data = {
      ...req.body,
      budgetId
    };
    
    const proposal = await budgetService.createProposal(data);
    
    return successResponse(res, proposal, 'Propuesta creada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene una propuesta por ID
 * GET /api/participation/proposals/:id
 */
export async function getProposal(req, res) {
  try {
    const { id } = req.params;
    const proposal = await budgetService.getProposalById(id);
    
    return successResponse(res, proposal);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Lista propuestas de una convocatoria
 * GET /api/participation/participatory-budgets/:budgetId/proposals
 */
export async function listProposals(req, res) {
  try {
    const { budgetId } = req.params;
    const filters = req.query;
    
    const result = await budgetService.listProposals(budgetId, filters);
    
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Evalúa técnicamente una propuesta
 * POST /api/participation/proposals/:id/evaluate
 */
export async function evaluateProposal(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user.id;
    
    const proposal = await budgetService.evaluateProposal(id, data, userId);
    
    return successResponse(res, proposal, 'Propuesta evaluada exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Vota por una propuesta
 * POST /api/participation/proposals/:id/vote
 */
export async function voteProposal(req, res) {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
      ipAddress: req.ip
    };
    
    const vote = await budgetService.voteProposal(id, data);
    
    return successResponse(res, vote, 'Voto registrado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Calcula ganadores de una convocatoria
 * POST /api/participation/participatory-budgets/:id/calculate-winners
 */
export async function calculateWinners(req, res) {
  try {
    const { id } = req.params;
    
    const results = await budgetService.calculateWinners(id);
    
    return successResponse(res, results, 'Ganadores calculados exitosamente');
  } catch (error) {
    return errorResponse(res, error);
  }
}

/**
 * Obtiene estadísticas de una convocatoria
 * GET /api/participation/participatory-budgets/:id/stats
 */
export async function getBudgetStats(req, res) {
  try {
    const { id } = req.params;
    
    const stats = await budgetService.getBudgetStats(id);
    
    return successResponse(res, stats);
  } catch (error) {
    return errorResponse(res, error);
  }
}
