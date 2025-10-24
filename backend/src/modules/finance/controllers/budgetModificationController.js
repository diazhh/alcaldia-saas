import * as budgetModificationService from '../services/budgetModification.service.js';

/**
 * Crear una modificación presupuestaria
 */
export const createModification = async (req, res) => {
  try {
    const modification = await budgetModificationService.createBudgetModification(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: modification,
      message: 'Modificación presupuestaria creada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener modificaciones de un presupuesto
 */
export const getModifications = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { status, type } = req.query;

    const modifications = await budgetModificationService.getBudgetModifications(
      budgetId,
      { status, type }
    );

    res.json({
      success: true,
      data: modifications,
      count: modifications.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener una modificación por ID
 */
export const getModificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const modification = await budgetModificationService.getBudgetModificationById(id);

    res.json({
      success: true,
      data: modification
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Aprobar una modificación presupuestaria
 */
export const approveModification = async (req, res) => {
  try {
    const { id } = req.params;
    const modification = await budgetModificationService.approveBudgetModification(
      id,
      req.user.id
    );

    res.json({
      success: true,
      data: modification,
      message: 'Modificación presupuestaria aprobada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Rechazar una modificación presupuestaria
 */
export const rejectModification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const modification = await budgetModificationService.rejectBudgetModification(
      id,
      req.user.id,
      reason
    );

    res.json({
      success: true,
      data: modification,
      message: 'Modificación presupuestaria rechazada'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de modificaciones
 */
export const getModificationStats = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const stats = await budgetModificationService.getModificationStats(budgetId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
