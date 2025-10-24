/**
 * Servicio de Exportación a PDF
 * Genera reportes financieros en formato PDF
 */

import PDFDocument from 'pdfkit';
import * as financialStatementsService from './financialStatements.service.js';
import * as reportsService from './reports.service.js';

class PDFExportService {
  /**
   * Configuración común de PDF
   */
  createPDF() {
    return new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });
  }

  /**
   * Agregar encabezado
   */
  addHeader(doc, title, subtitle = '') {
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' })
      .moveDown(0.5);

    if (subtitle) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(subtitle, { align: 'center' })
        .moveDown(1);
    } else {
      doc.moveDown(1);
    }

    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(562, doc.y)
      .stroke()
      .moveDown(1);
  }

  /**
   * Agregar pie de página
   */
  addFooter(doc, pageNumber, totalPages) {
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Página ${pageNumber} de ${totalPages}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      )
      .text(
        `Generado el ${new Date().toLocaleDateString('es-VE')} a las ${new Date().toLocaleTimeString('es-VE')}`,
        50,
        doc.page.height - 35,
        { align: 'center' }
      );
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Exportar Balance General a PDF
   */
  async exportBalanceSheetToPDF(date) {
    const balanceSheet = await financialStatementsService.getBalanceSheet(date);
    const doc = this.createPDF();

    this.addHeader(
      doc,
      'BALANCE GENERAL',
      `Al ${new Date(date).toLocaleDateString('es-VE')}`
    );

    // ACTIVOS
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('ACTIVOS', { underline: true })
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    balanceSheet.activos.accounts.forEach((account) => {
      doc.text(`${account.code} - ${account.name}`, 70);
      doc.text(this.formatCurrency(account.balance), 450, doc.y - 12, { width: 100, align: 'right' });
      doc.moveDown(0.3);
    });

    doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Total Activos:', 70);
    doc.text(this.formatCurrency(balanceSheet.activos.total), 450, doc.y - 12, { width: 100, align: 'right' });
    doc.moveDown(1);

    // PASIVOS
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('PASIVOS', { underline: true })
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    balanceSheet.pasivos.accounts.forEach((account) => {
      doc.text(`${account.code} - ${account.name}`, 70);
      doc.text(this.formatCurrency(account.balance), 450, doc.y - 12, { width: 100, align: 'right' });
      doc.moveDown(0.3);
    });

    doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Total Pasivos:', 70);
    doc.text(this.formatCurrency(balanceSheet.pasivos.total), 450, doc.y - 12, { width: 100, align: 'right' });
    doc.moveDown(1);

    // PATRIMONIO
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('PATRIMONIO', { underline: true })
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    balanceSheet.patrimonio.accounts.forEach((account) => {
      doc.text(`${account.code} - ${account.name}`, 70);
      doc.text(this.formatCurrency(account.balance), 450, doc.y - 12, { width: 100, align: 'right' });
      doc.moveDown(0.3);
    });

    doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Total Patrimonio:', 70);
    doc.text(this.formatCurrency(balanceSheet.patrimonio.total), 450, doc.y - 12, { width: 100, align: 'right' });
    doc.moveDown(1);

    // TOTAL
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('TOTAL PASIVOS + PATRIMONIO:', 70);
    doc.text(this.formatCurrency(balanceSheet.totalPasivosPatrimonio), 450, doc.y - 14, { width: 100, align: 'right' });

    this.addFooter(doc, 1, 1);

    doc.end();
    return doc;
  }

  /**
   * Exportar Estado de Resultados a PDF
   */
  async exportIncomeStatementToPDF(startDate, endDate) {
    const incomeStatement = await financialStatementsService.getIncomeStatement(startDate, endDate);
    const doc = this.createPDF();

    this.addHeader(
      doc,
      'ESTADO DE RESULTADOS',
      `Del ${new Date(startDate).toLocaleDateString('es-VE')} al ${new Date(endDate).toLocaleDateString('es-VE')}`
    );

    // INGRESOS
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('INGRESOS', { underline: true })
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    incomeStatement.ingresos.accounts.forEach((account) => {
      doc.text(`${account.code} - ${account.name}`, 70);
      doc.text(this.formatCurrency(account.balance), 450, doc.y - 12, { width: 100, align: 'right' });
      doc.moveDown(0.3);
    });

    doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Total Ingresos:', 70);
    doc.text(this.formatCurrency(incomeStatement.ingresos.total), 450, doc.y - 12, { width: 100, align: 'right' });
    doc.moveDown(1);

    // GASTOS
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('GASTOS', { underline: true })
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    incomeStatement.gastos.accounts.forEach((account) => {
      doc.text(`${account.code} - ${account.name}`, 70);
      doc.text(this.formatCurrency(account.balance), 450, doc.y - 12, { width: 100, align: 'right' });
      doc.moveDown(0.3);
    });

    doc
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Total Gastos:', 70);
    doc.text(this.formatCurrency(incomeStatement.gastos.total), 450, doc.y - 12, { width: 100, align: 'right' });
    doc.moveDown(1);

    // RESULTADO
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(incomeStatement.resultado >= 0 ? '#00aa00' : '#aa0000')
      .text(incomeStatement.resultado >= 0 ? 'UTILIDAD DEL EJERCICIO:' : 'PÉRDIDA DEL EJERCICIO:', 70);
    doc.text(this.formatCurrency(Math.abs(incomeStatement.resultado)), 450, doc.y - 14, { width: 100, align: 'right' });

    this.addFooter(doc, 1, 1);

    doc.end();
    return doc;
  }

  /**
   * Exportar Ejecución Presupuestaria a PDF
   */
  async exportBudgetExecutionToPDF(year) {
    const execution = await reportsService.getBudgetExecutionAnalysis(year);
    const doc = this.createPDF();

    this.addHeader(
      doc,
      'EJECUCIÓN PRESUPUESTARIA',
      `Año ${year}`
    );

    // Resumen
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('RESUMEN EJECUTIVO')
      .moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    const summary = [
      ['Presupuesto Aprobado:', this.formatCurrency(execution.totalApproved)],
      ['Comprometido:', this.formatCurrency(execution.totalCommitted)],
      ['Causado:', this.formatCurrency(execution.totalAccrued)],
      ['Pagado:', this.formatCurrency(execution.totalPaid)],
      ['Disponible:', this.formatCurrency(execution.totalAvailable)],
      ['% Ejecución:', `${execution.executionPercentage.toFixed(2)}%`],
    ];

    summary.forEach(([label, value]) => {
      doc.text(label, 70);
      doc.text(value, 450, doc.y - 12, { width: 100, align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // Detalle por partida
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('DETALLE POR PARTIDA')
      .moveDown(0.5);

    doc.fontSize(8).font('Helvetica');

    // Encabezados de tabla
    const tableTop = doc.y;
    doc
      .font('Helvetica-Bold')
      .text('Partida', 50, tableTop, { width: 150 })
      .text('Aprobado', 200, tableTop, { width: 70, align: 'right' })
      .text('Ejecutado', 270, tableTop, { width: 70, align: 'right' })
      .text('Disponible', 340, tableTop, { width: 70, align: 'right' })
      .text('% Ejec', 410, tableTop, { width: 50, align: 'right' });

    doc.moveDown(0.5);

    doc.font('Helvetica');

    execution.items.forEach((item, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }

      const y = doc.y;
      doc
        .text(`${item.code} - ${item.name}`, 50, y, { width: 150 })
        .text(this.formatCurrency(item.approved), 200, y, { width: 70, align: 'right' })
        .text(this.formatCurrency(item.executed), 270, y, { width: 70, align: 'right' })
        .text(this.formatCurrency(item.available), 340, y, { width: 70, align: 'right' })
        .text(`${item.executionPercentage.toFixed(1)}%`, 410, y, { width: 50, align: 'right' });

      doc.moveDown(0.5);
    });

    this.addFooter(doc, 1, 1);

    doc.end();
    return doc;
  }

  /**
   * Exportar Proyección de Flujo de Caja a PDF
   */
  async exportCashFlowProjectionToPDF(year, scenario = 'REALISTIC') {
    const doc = this.createPDF();

    this.addHeader(
      doc,
      'PROYECCIÓN DE FLUJO DE CAJA',
      `Año ${year} - Escenario ${scenario}`
    );

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Nota: Esta es una proyección basada en datos históricos y puede variar según las condiciones reales.')
      .moveDown(1);

    // Aquí se agregaría la lógica para obtener y mostrar las proyecciones
    // Por ahora, dejamos un placeholder

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Proyecciones mensuales disponibles en el sistema.')
      .moveDown(0.5);

    this.addFooter(doc, 1, 1);

    doc.end();
    return doc;
  }
}

export default new PDFExportService();
