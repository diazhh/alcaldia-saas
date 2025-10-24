/**
 * Controlador de Conciliación Bancaria
 */

import * as bankReconciliationService from '../services/bankReconciliation.service.js';

/**
 * Crear conciliación bancaria
 */
export async function createReconciliation(req, res, next) {
  try {
    const reconciliation = await bankReconciliationService.createReconciliation(
      req.body,
      req.user.id
    );
    res.status(201).json({
      success: true,
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener conciliaciones
 */
export async function getReconciliations(req, res, next) {
  try {
    const reconciliations = await bankReconciliationService.getReconciliations(req.query);
    res.json({
      success: true,
      data: reconciliations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener conciliación por ID
 */
export async function getReconciliationById(req, res, next) {
  try {
    const reconciliation = await bankReconciliationService.getReconciliationById(req.params.id);
    res.json({
      success: true,
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Agregar partida a conciliación
 */
export async function addReconciliationItem(req, res, next) {
  try {
    const item = await bankReconciliationService.addReconciliationItem(req.params.id, req.body);
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Marcar partida como conciliada
 */
export async function reconcileItem(req, res, next) {
  try {
    const item = await bankReconciliationService.reconcileItem(req.params.itemId);
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar partida
 */
export async function deleteReconciliationItem(req, res, next) {
  try {
    const result = await bankReconciliationService.deleteReconciliationItem(req.params.itemId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Completar conciliación
 */
export async function completeReconciliation(req, res, next) {
  try {
    const reconciliation = await bankReconciliationService.completeReconciliation(req.params.id);
    res.json({
      success: true,
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Aprobar conciliación
 */
export async function approveReconciliation(req, res, next) {
  try {
    const reconciliation = await bankReconciliationService.approveReconciliation(
      req.params.id,
      req.user.id
    );
    res.json({
      success: true,
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rechazar conciliación
 */
export async function rejectReconciliation(req, res, next) {
  try {
    const { reason } = req.body;
    const reconciliation = await bankReconciliationService.rejectReconciliation(
      req.params.id,
      reason
    );
    res.json({
      success: true,
      data: reconciliation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cargar transacciones del sistema
 */
export async function loadSystemTransactions(req, res, next) {
  try {
    const result = await bankReconciliationService.loadSystemTransactions(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas
 */
export async function getReconciliationStats(req, res, next) {
  try {
    const stats = await bankReconciliationService.getReconciliationStats(
      req.query.bankAccountId
    );
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

