/**
 * Controlador de Reportes Financieros
 */

import * as financialStatementsService from '../services/financialStatements.service.js';

/**
 * Genera el Balance General
 */
async function getBalanceSheet(req, res) {
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

    const result = await financialStatementsService.generateBalanceSheet(balanceDate);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al generar balance general:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el balance general',
      message: error.message,
    });
  }
}

/**
 * Genera el Estado de Resultados
 */
async function getIncomeStatement(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de inicio es requerida',
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await financialStatementsService.generateIncomeStatement(start, end);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al generar estado de resultados:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el estado de resultados',
      message: error.message,
    });
  }
}

/**
 * Genera el Estado de Flujo de Efectivo
 */
async function getCashFlowStatement(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de inicio es requerida',
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await financialStatementsService.generateCashFlowStatement(start, end);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al generar flujo de efectivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el flujo de efectivo',
      message: error.message,
    });
  }
}

/**
 * Genera análisis de ejecución presupuestaria
 */
async function getBudgetExecutionAnalysis(req, res) {
  try {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'El año es requerido',
      });
    }

    const result = await financialStatementsService.generateBudgetExecutionAnalysis(
      parseInt(year)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error al generar análisis de ejecución:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el análisis de ejecución presupuestaria',
      message: error.message,
    });
  }
}

/**
 * Genera reporte ONAPRE Form 1013 (Ejecución Financiera)
 */
async function getOnapreForm1013(req, res) {
  try {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'El año es requerido',
      });
    }

    const analysis = await financialStatementsService.generateBudgetExecutionAnalysis(
      parseInt(year)
    );

    // Formatear según estructura ONAPRE Form 1013
    const form1013 = {
      formType: 'FORM-1013',
      title: 'Ejecución Financiera del Presupuesto',
      year: parseInt(year),
      entity: 'Alcaldía Municipal',
      generatedAt: new Date(),
      data: {
        presupuestoAprobado: analysis.totals.allocated,
        presupuestoComprometido: analysis.totals.committed,
        presupuestoCausado: analysis.totals.accrued,
        presupuestoPagado: analysis.totals.paid,
        presupuestoDisponible: analysis.totals.available,
        porcentajeEjecucion: analysis.totals.executionRate,
        items: analysis.items.map(item => ({
          partidaPresupuestaria: item.code,
          denominacion: item.name,
          asignado: item.allocated,
          comprometido: item.committed,
          causado: item.accrued,
          pagado: item.paid,
          disponible: item.available,
          porcentajeEjecucion: item.executionRate,
        })),
      },
    };

    res.json({
      success: true,
      data: form1013,
    });
  } catch (error) {
    console.error('Error al generar Form 1013:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte ONAPRE Form 1013',
      message: error.message,
    });
  }
}

/**
 * Genera reporte ONAPRE Form 2345 (Balance General)
 */
async function getOnapreForm2345(req, res) {
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

    const balanceSheet = await financialStatementsService.generateBalanceSheet(balanceDate);

    // Formatear según estructura ONAPRE Form 2345
    const form2345 = {
      formType: 'FORM-2345',
      title: 'Balance General',
      date: balanceDate,
      entity: 'Alcaldía Municipal',
      generatedAt: new Date(),
      data: {
        activos: {
          cuentas: balanceSheet.activos.accounts.map(a => ({
            codigo: a.code,
            nombre: a.name,
            monto: a.balance,
          })),
          total: balanceSheet.activos.total,
        },
        pasivos: {
          cuentas: balanceSheet.pasivos.accounts.map(a => ({
            codigo: a.code,
            nombre: a.name,
            monto: a.balance,
          })),
          total: balanceSheet.pasivos.total,
        },
        patrimonio: {
          cuentas: balanceSheet.patrimonio.accounts.map(a => ({
            codigo: a.code,
            nombre: a.name,
            monto: a.balance,
          })),
          total: balanceSheet.patrimonio.total,
        },
        totalActivos: balanceSheet.activos.total,
        totalPasivosPatrimonio: balanceSheet.totalPasivosPatrimonio,
        balanceado: balanceSheet.balanced,
      },
    };

    res.json({
      success: true,
      data: form2345,
    });
  } catch (error) {
    console.error('Error al generar Form 2345:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar el reporte ONAPRE Form 2345',
      message: error.message,
    });
  }
}

export {
  getBalanceSheet,
  getIncomeStatement,
  getCashFlowStatement,
  getBudgetExecutionAnalysis,
  getOnapreForm1013,
  getOnapreForm2345,
};
