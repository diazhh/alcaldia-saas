/**
 * Servicio de Exportación de Reportes Financieros
 * Exporta reportes a PDF y Excel
 */

import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

class ExportService {
  /**
   * Exportar Balance General a Excel
   */
  async exportBalanceSheetToExcel(balanceSheet) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Balance General');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Cuenta', key: 'name', width: 40 },
      { header: 'Debe', key: 'debit', width: 15 },
      { header: 'Haber', key: 'credit', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
    ];

    // Título
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'BALANCE GENERAL';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Fecha
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = `Al ${new Date(balanceSheet.date).toLocaleDateString()}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    let currentRow = 4;

    // ACTIVOS
    worksheet.getCell(`A${currentRow}`).value = 'ACTIVOS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    balanceSheet.activos.accounts.forEach((account) => {
      worksheet.addRow({
        code: account.code,
        name: account.name,
        debit: account.debit,
        credit: account.credit,
        balance: account.balance,
      });
      currentRow++;
    });

    worksheet.getCell(`D${currentRow}`).value = 'Total Activos:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).value = balanceSheet.activos.total;
    worksheet.getCell(`E${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
    currentRow += 2;

    // PASIVOS
    worksheet.getCell(`A${currentRow}`).value = 'PASIVOS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    balanceSheet.pasivos.accounts.forEach((account) => {
      worksheet.addRow({
        code: account.code,
        name: account.name,
        debit: account.debit,
        credit: account.credit,
        balance: account.balance,
      });
      currentRow++;
    });

    worksheet.getCell(`D${currentRow}`).value = 'Total Pasivos:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).value = balanceSheet.pasivos.total;
    worksheet.getCell(`E${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
    currentRow += 2;

    // PATRIMONIO
    worksheet.getCell(`A${currentRow}`).value = 'PATRIMONIO';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    balanceSheet.patrimonio.accounts.forEach((account) => {
      worksheet.addRow({
        code: account.code,
        name: account.name,
        debit: account.debit,
        credit: account.credit,
        balance: account.balance,
      });
      currentRow++;
    });

    worksheet.getCell(`D${currentRow}`).value = 'Total Patrimonio:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).value = balanceSheet.patrimonio.total;
    worksheet.getCell(`E${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
    currentRow += 2;

    // TOTAL PASIVOS + PATRIMONIO
    worksheet.getCell(`D${currentRow}`).value = 'Total Pasivos + Patrimonio:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).value = balanceSheet.totalPasivosPatrimonio;
    worksheet.getCell(`E${currentRow}`).font = { bold: true };
    worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';

    // Aplicar formato de moneda a las columnas numéricas
    worksheet.getColumn('debit').numFmt = '#,##0.00';
    worksheet.getColumn('credit').numFmt = '#,##0.00';
    worksheet.getColumn('balance').numFmt = '#,##0.00';

    return workbook;
  }

  /**
   * Exportar Estado de Resultados a Excel
   */
  async exportIncomeStatementToExcel(incomeStatement) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estado de Resultados');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Cuenta', key: 'name', width: 40 },
      { header: 'Monto', key: 'balance', width: 15 },
    ];

    // Título
    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').value = 'ESTADO DE RESULTADOS';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Período
    worksheet.mergeCells('A2:C2');
    const startDate = new Date(incomeStatement.period.startDate).toLocaleDateString();
    const endDate = new Date(incomeStatement.period.endDate).toLocaleDateString();
    worksheet.getCell('A2').value = `Del ${startDate} al ${endDate}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    let currentRow = 4;

    // INGRESOS
    worksheet.getCell(`A${currentRow}`).value = 'INGRESOS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    incomeStatement.ingresos.accounts.forEach((account) => {
      worksheet.addRow({
        code: account.code,
        name: account.name,
        balance: account.balance,
      });
      currentRow++;
    });

    worksheet.getCell(`B${currentRow}`).value = 'Total Ingresos:';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).value = incomeStatement.ingresos.total;
    worksheet.getCell(`C${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
    currentRow += 2;

    // GASTOS
    worksheet.getCell(`A${currentRow}`).value = 'GASTOS';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    incomeStatement.gastos.accounts.forEach((account) => {
      worksheet.addRow({
        code: account.code,
        name: account.name,
        balance: account.balance,
      });
      currentRow++;
    });

    worksheet.getCell(`B${currentRow}`).value = 'Total Gastos:';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).value = incomeStatement.gastos.total;
    worksheet.getCell(`C${currentRow}`).font = { bold: true };
    worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
    currentRow += 2;

    // RESULTADO NETO
    worksheet.getCell(`B${currentRow}`).value = 'RESULTADO NETO:';
    worksheet.getCell(`B${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${currentRow}`).value = incomeStatement.resultadoNeto;
    worksheet.getCell(`C${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
    
    // Color según resultado
    if (incomeStatement.resultadoNeto >= 0) {
      worksheet.getCell(`C${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' },
      };
    } else {
      worksheet.getCell(`C${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCB' },
      };
    }

    // Aplicar formato de moneda
    worksheet.getColumn('balance').numFmt = '#,##0.00';

    return workbook;
  }

  /**
   * Exportar Ejecución Presupuestaria a Excel
   */
  async exportBudgetExecutionToExcel(execution) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ejecución Presupuestaria');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Partida', key: 'name', width: 40 },
      { header: 'Asignado', key: 'allocated', width: 15 },
      { header: 'Comprometido', key: 'committed', width: 15 },
      { header: 'Causado', key: 'accrued', width: 15 },
      { header: 'Pagado', key: 'paid', width: 15 },
      { header: 'Disponible', key: 'available', width: 15 },
      { header: '% Ejecución', key: 'executionRate', width: 12 },
    ];

    // Título
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `EJECUCIÓN PRESUPUESTARIA ${execution.year}`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.addRow({}); // Espacio

    // Encabezados
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Datos
    execution.items.forEach((item) => {
      worksheet.addRow({
        code: item.code,
        name: item.name,
        allocated: item.allocated,
        committed: item.committed,
        accrued: item.accrued,
        paid: item.paid,
        available: item.available,
        executionRate: item.executionRate,
      });
    });

    // Totales
    const totalRow = worksheet.addRow({
      code: '',
      name: 'TOTALES',
      allocated: execution.totals.allocated,
      committed: execution.totals.committed,
      accrued: execution.totals.accrued,
      paid: execution.totals.paid,
      available: execution.totals.available,
      executionRate: execution.totals.executionRate,
    });
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    // Aplicar formatos
    worksheet.getColumn('allocated').numFmt = '#,##0.00';
    worksheet.getColumn('committed').numFmt = '#,##0.00';
    worksheet.getColumn('accrued').numFmt = '#,##0.00';
    worksheet.getColumn('paid').numFmt = '#,##0.00';
    worksheet.getColumn('available').numFmt = '#,##0.00';
    worksheet.getColumn('executionRate').numFmt = '0.00"%"';

    return workbook;
  }

  /**
   * Exportar Proyección de Flujo de Caja a Excel
   */
  async exportCashFlowProjectionToExcel(projections, year) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Proyección Flujo de Caja');

    // Configurar columnas
    worksheet.columns = [
      { header: 'Mes', key: 'month', width: 15 },
      { header: 'Ingresos Proyectados', key: 'projectedIncome', width: 18 },
      { header: 'Egresos Proyectados', key: 'projectedExpense', width: 18 },
      { header: 'Balance Proyectado', key: 'projectedBalance', width: 18 },
      { header: 'Ingresos Reales', key: 'actualIncome', width: 18 },
      { header: 'Egresos Reales', key: 'actualExpense', width: 18 },
      { header: 'Balance Real', key: 'actualBalance', width: 18 },
      { header: 'Variación', key: 'variance', width: 15 },
    ];

    // Título
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `PROYECCIÓN DE FLUJO DE CAJA ${year}`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.addRow({}); // Espacio

    // Encabezados
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    // Datos
    projections.forEach((proj, index) => {
      if (proj) {
        worksheet.addRow({
          month: months[index],
          projectedIncome: Number(proj.projectedIncome),
          projectedExpense: Number(proj.projectedExpense),
          projectedBalance: Number(proj.projectedBalance),
          actualIncome: proj.actualIncome ? Number(proj.actualIncome) : null,
          actualExpense: proj.actualExpense ? Number(proj.actualExpense) : null,
          actualBalance: proj.actualBalance ? Number(proj.actualBalance) : null,
          variance: proj.balanceVariance ? Number(proj.balanceVariance) : null,
        });
      }
    });

    // Aplicar formatos
    ['projectedIncome', 'projectedExpense', 'projectedBalance', 'actualIncome', 'actualExpense', 'actualBalance', 'variance'].forEach((col) => {
      worksheet.getColumn(col).numFmt = '#,##0.00';
    });

    return workbook;
  }
}

export default new ExportService();
