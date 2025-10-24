/**
 * Controlador de Exportación de Reportes
 *
 * NOTA: Algunos servicios están comentados temporalmente por problemas de módulos ES6/CommonJS
 * TODO: Convertir todos los servicios a ES6 modules
 */

import exportService from '../services/export.service.js';
// import pdfExportService from '../services/pdfExport.service.js'; // TODO: Convert to ES6
import * as financialStatements from '../services/financialStatements.service.js';
import cashFlowProjectionService from '../services/cashFlowProjection.service.js';

/**
 * Exportar Balance General a Excel
 */
export async function exportBalanceSheetToExcel(req, res) {
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

    const balanceSheet = await financialStatements.generateBalanceSheet(balanceDate);
    const workbook = await exportService.exportBalanceSheetToExcel(balanceSheet);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=balance-general-${balanceDate.toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando balance general:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar balance general',
    });
  }
}

/**
 * Exportar Estado de Resultados a Excel
 */
export async function exportIncomeStatementToExcel(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechas de inicio y fin',
      });
    }

    const incomeStatement = await financialStatements.generateIncomeStatement(
      new Date(startDate),
      new Date(endDate)
    );
    const workbook = await exportService.exportIncomeStatementToExcel(incomeStatement);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=estado-resultados-${startDate}-${endDate}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando estado de resultados:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar estado de resultados',
    });
  }
}

/**
 * Exportar Ejecución Presupuestaria a Excel
 */
export async function exportBudgetExecutionToExcel(req, res) {
  try {
    const { year } = req.params;

    const execution = await financialStatements.generateBudgetExecutionAnalysis(parseInt(year));
    const workbook = await exportService.exportBudgetExecutionToExcel(execution);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ejecucion-presupuestaria-${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando ejecución presupuestaria:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar ejecución presupuestaria',
    });
  }
}

/**
 * Exportar Proyección de Flujo de Caja a Excel
 */
export async function exportCashFlowProjectionToExcel(req, res) {
  try {
    const { year } = req.params;
    const { scenario } = req.query;

    const projections = await cashFlowProjectionService.getYearProjections(
      parseInt(year),
      scenario || 'REALISTIC'
    );
    const workbook = await exportService.exportCashFlowProjectionToExcel(projections, year);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=proyeccion-flujo-caja-${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exportando proyección de flujo de caja:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar proyección de flujo de caja',
    });
  }
}

/**
 * Exportar Balance General a PDF
 */
export async function exportBalanceSheetToPDF(req, res) {
  try {
    const { date } = req.query;
    const balanceDate = date ? new Date(date) : new Date();

    // const pdfDoc = await pdfExportService.exportBalanceSheetToPDF(balanceDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=balance-general-${balanceDate.toISOString().split('T')[0]}.pdf`
    );

    pdfDoc.pipe(res);
  } catch (error) {
    console.error('Error exportando balance general a PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar balance general a PDF',
    });
  }
}

/**
 * Exportar Estado de Resultados a PDF
 */
export async function exportIncomeStatementToPDF(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechas de inicio y fin',
      });
    }

    // const pdfDoc = await pdfExportService.exportIncomeStatementToPDF(
      new Date(startDate),
      new Date(endDate)
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=estado-resultados-${startDate}-${endDate}.pdf`
    );

    pdfDoc.pipe(res);
  } catch (error) {
    console.error('Error exportando estado de resultados a PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar estado de resultados a PDF',
    });
  }
}

/**
 * Exportar Ejecución Presupuestaria a PDF
 */
export async function exportBudgetExecutionToPDF(req, res) {
  try {
    const { year } = req.params;

    // const pdfDoc = await pdfExportService.exportBudgetExecutionToPDF(parseInt(year));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ejecucion-presupuestaria-${year}.pdf`
    );

    pdfDoc.pipe(res);
  } catch (error) {
    console.error('Error exportando ejecución presupuestaria a PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar ejecución presupuestaria a PDF',
    });
  }
}

/**
 * Exportar Proyección de Flujo de Caja a PDF
 */
export async function exportCashFlowProjectionToPDF(req, res) {
  try {
    const { year } = req.params;
    const { scenario } = req.query;

    // const pdfDoc = await pdfExportService.exportCashFlowProjectionToPDF(
      parseInt(year),
      scenario || 'REALISTIC'
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=proyeccion-flujo-caja-${year}.pdf`
    );

    pdfDoc.pipe(res);
  } catch (error) {
    console.error('Error exportando proyección de flujo de caja a PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar proyección de flujo de caja a PDF',
    });
  }
}
