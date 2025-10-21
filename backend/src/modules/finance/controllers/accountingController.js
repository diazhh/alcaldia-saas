/**
 * Controlador de Contabilidad
 */

import * as accountingService from '../services/accounting.service.js';

/**
 * Obtiene el libro diario
 */
async function getGeneralJournal(req, res) {
  try {
    const { startDate, endDate, page, limit } = req.query;

    const result = await accountingService.getGeneralJournal({
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al obtener libro diario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el libro diario',
      message: error.message,
    });
  }
}

/**
 * Obtiene el libro mayor
 */
async function getGeneralLedger(req, res) {
  try {
    const { accountCode, startDate, endDate } = req.query;

    const result = await accountingService.getGeneralLedger({
      accountCode,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al obtener libro mayor:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el libro mayor',
      message: error.message,
    });
  }
}

/**
 * Obtiene el balance de comprobación
 */
async function getTrialBalance(req, res) {
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

    const result = await accountingService.getTrialBalance(balanceDate);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al obtener balance de comprobación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el balance de comprobación',
      message: error.message,
    });
  }
}

/**
 * Obtiene el plan de cuentas
 */
async function getChartOfAccounts(req, res) {
  try {
    res.json({
      success: true,
      data: accountingService.CHART_OF_ACCOUNTS,
    });
  } catch (error) {
    console.error('Error al obtener plan de cuentas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el plan de cuentas',
      message: error.message,
    });
  }
}

/**
 * Crea un asiento contable manual
 */
async function createManualEntry(req, res) {
  try {
    const { description, details, reference } = req.body;
    const userId = req.user.id;

    const entry = await accountingService.createAccountingEntry({
      description,
      details,
      reference,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Asiento contable creado exitosamente',
    });
  } catch (error) {
    console.error('Error al crear asiento contable:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el asiento contable',
      message: error.message,
    });
  }
}

export {
  getGeneralJournal,
  getGeneralLedger,
  getTrialBalance,
  getChartOfAccounts,
  createManualEntry,
};
