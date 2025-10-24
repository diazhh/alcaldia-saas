/**
 * Servicio de Generación de Reportes Tributarios
 * Soporta PDF, Excel y CSV
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import prisma from '../../../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Obtener datos de recaudación por período
 */
async function getCollectionData(period) {
  const { startDate, endDate } = parsePeriod(period);

  const payments = await prisma.taxPayment.findMany({
    where: {
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      taxpayer: {
        select: {
          taxId: true,
          firstName: true,
          lastName: true,
          businessName: true,
          taxpayerType: true
        }
      },
      taxBill: {
        select: {
          billNumber: true,
          taxType: true
        }
      }
    },
    orderBy: {
      paymentDate: 'desc'
    }
  });

  return payments.map(p => ({
    fecha: formatDate(p.paymentDate),
    recibo: p.receiptNumber,
    contribuyente: p.taxpayer.taxpayerType === 'LEGAL'
      ? p.taxpayer.businessName
      : `${p.taxpayer.firstName} ${p.taxpayer.lastName}`,
    rif: p.taxpayer.taxId,
    factura: p.taxBill?.billNumber || 'N/A',
    tipoImpuesto: getTaxTypeName(p.taxBill?.taxType),
    metodo: getPaymentMethodName(p.paymentMethod),
    monto: Number(p.amount),
    referencia: p.referenceNumber || 'N/A'
  }));
}

/**
 * Obtener datos de morosos
 */
async function getDefaultersData(period) {
  const { startDate, endDate } = parsePeriod(period);

  const bills = await prisma.taxBill.findMany({
    where: {
      status: {
        in: ['PENDING', 'OVERDUE', 'PARTIAL']
      },
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      taxpayer: {
        select: {
          taxId: true,
          firstName: true,
          lastName: true,
          businessName: true,
          taxpayerType: true,
          phone: true,
          email: true
        }
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });

  return bills.map(b => ({
    contribuyente: b.taxpayer.taxpayerType === 'LEGAL'
      ? b.taxpayer.businessName
      : `${b.taxpayer.firstName} ${b.taxpayer.lastName}`,
    rif: b.taxpayer.taxId,
    telefono: b.taxpayer.phone || 'N/A',
    email: b.taxpayer.email || 'N/A',
    factura: b.billNumber,
    concepto: b.concept,
    fechaVencimiento: formatDate(b.dueDate),
    diasVencidos: Math.floor((new Date() - new Date(b.dueDate)) / (1000 * 60 * 60 * 24)),
    montoTotal: Number(b.totalAmount),
    montoPagado: Number(b.paidAmount),
    saldoPendiente: Number(b.balanceAmount),
    estado: getBillStatusName(b.status)
  }));
}

/**
 * Obtener datos de contribuyentes
 */
async function getTaxpayersData() {
  const taxpayers = await prisma.taxpayer.findMany({
    where: {
      status: 'ACTIVE'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return taxpayers.map(t => ({
    rif: t.taxId,
    tipo: t.taxpayerType === 'LEGAL' ? 'Jurídica' : 'Natural',
    nombre: t.taxpayerType === 'LEGAL'
      ? t.businessName
      : `${t.firstName} ${t.lastName}`,
    email: t.email || 'N/A',
    telefono: t.phone || 'N/A',
    direccion: t.address || 'N/A',
    parroquia: t.parish || 'N/A',
    fechaRegistro: formatDate(t.createdAt),
    estado: t.status
  }));
}

/**
 * Obtener datos de solvencias
 */
async function getSolvenciesData(period) {
  const { startDate, endDate } = parsePeriod(period);

  const solvencies = await prisma.solvency.findMany({
    where: {
      issueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      taxpayer: {
        select: {
          taxId: true,
          firstName: true,
          lastName: true,
          businessName: true,
          taxpayerType: true
        }
      }
    },
    orderBy: {
      issueDate: 'desc'
    }
  });

  return solvencies.map(s => ({
    numero: s.solvencyNumber,
    contribuyente: s.taxpayer.taxpayerType === 'LEGAL'
      ? s.taxpayer.businessName
      : `${s.taxpayer.firstName} ${s.taxpayer.lastName}`,
    rif: s.taxpayer.taxId,
    tipo: getSolvencyTypeName(s.solvencyType),
    fechaEmision: formatDate(s.issueDate),
    fechaVencimiento: formatDate(s.expiryDate),
    estado: s.status,
    emitidoPor: s.issuedBy || 'Sistema'
  }));
}

/**
 * Obtener datos de eficiencia tributaria
 */
async function getEfficiencyData(period) {
  const { startDate, endDate } = parsePeriod(period);

  // Recaudación total
  const totalCollection = await prisma.taxPayment.aggregate({
    where: {
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    },
    _count: true
  });

  // Facturas emitidas
  const billsIssued = await prisma.taxBill.count({
    where: {
      issueDate: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Facturas pagadas
  const billsPaid = await prisma.taxBill.count({
    where: {
      issueDate: {
        gte: startDate,
        lte: endDate
      },
      status: 'PAID'
    }
  });

  // Solvencias emitidas
  const solvenciesIssued = await prisma.solvency.count({
    where: {
      issueDate: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Casos de cobranza
  const collectionCases = await prisma.debtCollection.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  return [
    {
      indicador: 'Recaudación Total',
      valor: `Bs. ${Number(totalCollection._sum.amount || 0).toLocaleString('es-VE')}`,
      cantidad: totalCollection._count
    },
    {
      indicador: 'Facturas Emitidas',
      valor: billsIssued,
      cantidad: billsIssued
    },
    {
      indicador: 'Facturas Pagadas',
      valor: billsPaid,
      cantidad: billsPaid
    },
    {
      indicador: 'Eficiencia de Cobro',
      valor: billsIssued > 0 ? `${((billsPaid / billsIssued) * 100).toFixed(2)}%` : '0%',
      cantidad: null
    },
    {
      indicador: 'Solvencias Emitidas',
      valor: solvenciesIssued,
      cantidad: solvenciesIssued
    },
    {
      indicador: 'Casos de Cobranza',
      valor: collectionCases,
      cantidad: collectionCases
    }
  ];
}

/**
 * Obtener datos de patentes comerciales
 */
async function getBusinessLicensesData() {
  const businesses = await prisma.business.findMany({
    include: {
      taxpayer: {
        select: {
          taxId: true,
          businessName: true
        }
      }
    },
    orderBy: {
      licenseDate: 'desc'
    }
  });

  return businesses.map(b => ({
    licencia: b.licenseNumber,
    negocio: b.businessName,
    nombreComercial: b.tradeName || 'N/A',
    rif: b.taxpayer.taxId,
    actividad: b.activityName,
    codigoCIIU: b.activityCode,
    categoria: b.category,
    direccion: b.address,
    parroquia: b.parish,
    fechaApertura: formatDate(b.openingDate),
    fechaLicencia: formatDate(b.licenseDate),
    fechaVencimiento: formatDate(b.expiryDate),
    estado: b.status
  }));
}

/**
 * Generar reporte en formato PDF
 */
export async function generatePDFReport(reportType, period) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).text('Sistema Integral de Gestión Municipal', { align: 'center' });
      doc.fontSize(16).text(getReportTitle(reportType), { align: 'center' });
      doc.fontSize(10).text(`Período: ${getPeriodName(period)}`, { align: 'center' });
      doc.fontSize(10).text(`Fecha de generación: ${formatDate(new Date())}`, { align: 'center' });
      doc.moveDown(2);

      // Obtener datos según tipo de reporte
      let data;
      switch (reportType) {
        case 'collection':
          data = await getCollectionData(period);
          generateCollectionPDF(doc, data);
          break;
        case 'defaulters':
          data = await getDefaultersData(period);
          generateDefaultersPDF(doc, data);
          break;
        case 'taxpayers':
          data = await getTaxpayersData();
          generateTaxpayersPDF(doc, data);
          break;
        case 'solvencies':
          data = await getSolvenciesData(period);
          generateSolvenciesPDF(doc, data);
          break;
        case 'efficiency':
          data = await getEfficiencyData(period);
          generateEfficiencyPDF(doc, data);
          break;
        case 'business-licenses':
          data = await getBusinessLicensesData();
          generateBusinessLicensesPDF(doc, data);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      // Pie de página
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(
          `Página ${i + 1} de ${pages.count}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generar PDF de recaudación
 */
function generateCollectionPDF(doc, data) {
  doc.fontSize(12).text('Resumen de Recaudación', { underline: true });
  doc.moveDown();

  const total = data.reduce((sum, item) => sum + item.monto, 0);
  doc.fontSize(10).text(`Total recaudado: Bs. ${total.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`);
  doc.text(`Total de pagos: ${data.length}`);
  doc.moveDown(2);

  // Tabla simplificada
  doc.fontSize(8);
  data.slice(0, 50).forEach((item, index) => {
    doc.text(`${index + 1}. ${item.fecha} - ${item.contribuyente} (${item.rif})`);
    doc.text(`   Recibo: ${item.recibo} | Monto: Bs. ${item.monto.toLocaleString('es-VE')} | Método: ${item.metodo}`);
    doc.moveDown(0.5);
  });

  if (data.length > 50) {
    doc.text(`... y ${data.length - 50} registros más`);
  }
}

/**
 * Generar PDF de morosos
 */
function generateDefaultersPDF(doc, data) {
  doc.fontSize(12).text('Cartera de Morosos', { underline: true });
  doc.moveDown();

  const totalDebt = data.reduce((sum, item) => sum + item.saldoPendiente, 0);
  doc.fontSize(10).text(`Deuda total: Bs. ${totalDebt.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`);
  doc.text(`Total de morosos: ${data.length}`);
  doc.moveDown(2);

  doc.fontSize(8);
  data.slice(0, 40).forEach((item, index) => {
    doc.text(`${index + 1}. ${item.contribuyente} (${item.rif})`);
    doc.text(`   Factura: ${item.factura} | Vencimiento: ${item.fechaVencimiento} | Días: ${item.diasVencidos}`);
    doc.text(`   Saldo: Bs. ${item.saldoPendiente.toLocaleString('es-VE')} | Tel: ${item.telefono}`);
    doc.moveDown(0.5);
  });

  if (data.length > 40) {
    doc.text(`... y ${data.length - 40} registros más`);
  }
}

/**
 * Generar PDF de contribuyentes
 */
function generateTaxpayersPDF(doc, data) {
  doc.fontSize(12).text('Registro de Contribuyentes', { underline: true });
  doc.moveDown();

  doc.fontSize(10).text(`Total de contribuyentes: ${data.length}`);
  doc.moveDown(2);

  doc.fontSize(8);
  data.slice(0, 50).forEach((item, index) => {
    doc.text(`${index + 1}. ${item.nombre} (${item.rif}) - ${item.tipo}`);
    doc.text(`   Email: ${item.email} | Tel: ${item.telefono} | Parroquia: ${item.parroquia}`);
    doc.moveDown(0.5);
  });

  if (data.length > 50) {
    doc.text(`... y ${data.length - 50} registros más`);
  }
}

/**
 * Generar PDF de solvencias
 */
function generateSolvenciesPDF(doc, data) {
  doc.fontSize(12).text('Solvencias Emitidas', { underline: true });
  doc.moveDown();

  doc.fontSize(10).text(`Total de solvencias: ${data.length}`);
  doc.moveDown(2);

  doc.fontSize(8);
  data.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.numero} - ${item.contribuyente} (${item.rif})`);
    doc.text(`   Tipo: ${item.tipo} | Emisión: ${item.fechaEmision} | Vence: ${item.fechaVencimiento} | Estado: ${item.estado}`);
    doc.moveDown(0.5);
  });
}

/**
 * Generar PDF de eficiencia
 */
function generateEfficiencyPDF(doc, data) {
  doc.fontSize(12).text('Indicadores de Eficiencia Tributaria', { underline: true });
  doc.moveDown(2);

  doc.fontSize(10);
  data.forEach(item => {
    doc.text(`${item.indicador}: ${item.valor}`);
    doc.moveDown();
  });
}

/**
 * Generar PDF de patentes
 */
function generateBusinessLicensesPDF(doc, data) {
  doc.fontSize(12).text('Patentes Comerciales', { underline: true });
  doc.moveDown();

  doc.fontSize(10).text(`Total de patentes: ${data.length}`);
  doc.moveDown(2);

  doc.fontSize(8);
  data.slice(0, 40).forEach((item, index) => {
    doc.text(`${index + 1}. ${item.licencia} - ${item.negocio}`);
    doc.text(`   RIF: ${item.rif} | Actividad: ${item.actividad} (${item.codigoCIIU})`);
    doc.text(`   Licencia: ${item.fechaLicencia} | Vence: ${item.fechaVencimiento} | Estado: ${item.estado}`);
    doc.moveDown(0.5);
  });

  if (data.length > 40) {
    doc.text(`... y ${data.length - 40} registros más`);
  }
}

/**
 * Generar reporte en formato Excel
 */
export async function generateExcelReport(reportType, period) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  // Metadata
  workbook.creator = 'Sistema Integral de Gestión Municipal';
  workbook.created = new Date();

  // Estilos
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };

  // Obtener datos y configurar columnas según tipo
  let data, columns;
  switch (reportType) {
    case 'collection':
      data = await getCollectionData(period);
      columns = [
        { header: 'Fecha', key: 'fecha', width: 12 },
        { header: 'Recibo', key: 'recibo', width: 18 },
        { header: 'Contribuyente', key: 'contribuyente', width: 30 },
        { header: 'RIF/CI', key: 'rif', width: 15 },
        { header: 'Factura', key: 'factura', width: 18 },
        { header: 'Tipo Impuesto', key: 'tipoImpuesto', width: 20 },
        { header: 'Método', key: 'metodo', width: 15 },
        { header: 'Monto (Bs.)', key: 'monto', width: 15 },
        { header: 'Referencia', key: 'referencia', width: 20 }
      ];
      break;
    case 'defaulters':
      data = await getDefaultersData(period);
      columns = [
        { header: 'Contribuyente', key: 'contribuyente', width: 30 },
        { header: 'RIF/CI', key: 'rif', width: 15 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Factura', key: 'factura', width: 18 },
        { header: 'Concepto', key: 'concepto', width: 30 },
        { header: 'Vencimiento', key: 'fechaVencimiento', width: 12 },
        { header: 'Días Vencidos', key: 'diasVencidos', width: 12 },
        { header: 'Monto Total (Bs.)', key: 'montoTotal', width: 15 },
        { header: 'Pagado (Bs.)', key: 'montoPagado', width: 15 },
        { header: 'Saldo (Bs.)', key: 'saldoPendiente', width: 15 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];
      break;
    case 'taxpayers':
      data = await getTaxpayersData();
      columns = [
        { header: 'RIF/CI', key: 'rif', width: 15 },
        { header: 'Tipo', key: 'tipo', width: 12 },
        { header: 'Nombre', key: 'nombre', width: 35 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 40 },
        { header: 'Parroquia', key: 'parroquia', width: 15 },
        { header: 'Fecha Registro', key: 'fechaRegistro', width: 12 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];
      break;
    case 'solvencies':
      data = await getSolvenciesData(period);
      columns = [
        { header: 'Número', key: 'numero', width: 20 },
        { header: 'Contribuyente', key: 'contribuyente', width: 30 },
        { header: 'RIF/CI', key: 'rif', width: 15 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Fecha Emisión', key: 'fechaEmision', width: 12 },
        { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 12 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Emitido Por', key: 'emitidoPor', width: 20 }
      ];
      break;
    case 'efficiency':
      data = await getEfficiencyData(period);
      columns = [
        { header: 'Indicador', key: 'indicador', width: 30 },
        { header: 'Valor', key: 'valor', width: 20 }
      ];
      break;
    case 'business-licenses':
      data = await getBusinessLicensesData();
      columns = [
        { header: 'Licencia', key: 'licencia', width: 18 },
        { header: 'Negocio', key: 'negocio', width: 30 },
        { header: 'Nombre Comercial', key: 'nombreComercial', width: 25 },
        { header: 'RIF', key: 'rif', width: 15 },
        { header: 'Actividad', key: 'actividad', width: 35 },
        { header: 'CIIU', key: 'codigoCIIU', width: 10 },
        { header: 'Categoría', key: 'categoria', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 40 },
        { header: 'Parroquia', key: 'parroquia', width: 15 },
        { header: 'Fecha Apertura', key: 'fechaApertura', width: 12 },
        { header: 'Fecha Licencia', key: 'fechaLicencia', width: 12 },
        { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 12 },
        { header: 'Estado', key: 'estado', width: 12 }
      ];
      break;
    default:
      throw new Error('Tipo de reporte no válido');
  }

  worksheet.columns = columns;

  // Aplicar estilo al encabezado
  worksheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });

  // Agregar datos
  data.forEach(row => {
    worksheet.addRow(row);
  });

  // Formato numérico para columnas de montos
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell, colNumber) => {
        if (typeof cell.value === 'number' && columns[colNumber - 1]?.key?.includes('monto')) {
          cell.numFmt = '#,##0.00';
        }
      });
    }
  });

  // Generar buffer
  return await workbook.xlsx.writeBuffer();
}

/**
 * Generar reporte en formato CSV
 */
export async function generateCSVReport(reportType, period) {
  // Obtener datos según tipo
  let data;
  switch (reportType) {
    case 'collection':
      data = await getCollectionData(period);
      break;
    case 'defaulters':
      data = await getDefaultersData(period);
      break;
    case 'taxpayers':
      data = await getTaxpayersData();
      break;
    case 'solvencies':
      data = await getSolvenciesData(period);
      break;
    case 'efficiency':
      data = await getEfficiencyData(period);
      break;
    case 'business-licenses':
      data = await getBusinessLicensesData();
      break;
    default:
      throw new Error('Tipo de reporte no válido');
  }

  // Convertir a CSV manualmente
  if (data.length === 0) {
    return 'No hay datos disponibles';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Encabezados
  csvRows.push(headers.join(','));

  // Datos
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const escaped = ('' + value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Funciones auxiliares

function parsePeriod(period) {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'current-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'current-quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
      break;
    case 'last-quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      startDate = new Date(now.getFullYear(), lastQuarter * 3, 1);
      endDate = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0, 23, 59, 59);
      break;
    case 'current-year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'last-year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  return { startDate, endDate };
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function getReportTitle(type) {
  const titles = {
    'collection': 'Reporte de Recaudación',
    'defaulters': 'Cartera de Morosos',
    'taxpayers': 'Registro de Contribuyentes',
    'solvencies': 'Solvencias Emitidas',
    'efficiency': 'Indicadores de Eficiencia Tributaria',
    'business-licenses': 'Patentes Comerciales'
  };
  return titles[type] || 'Reporte Tributario';
}

function getPeriodName(period) {
  const names = {
    'current-month': 'Mes Actual',
    'last-month': 'Mes Anterior',
    'current-quarter': 'Trimestre Actual',
    'last-quarter': 'Trimestre Anterior',
    'current-year': 'Año Actual',
    'last-year': 'Año Anterior'
  };
  return names[period] || period;
}

function getTaxTypeName(type) {
  const names = {
    'BUSINESS_TAX': 'Patente Comercial',
    'PROPERTY_TAX': 'Impuesto Inmobiliario',
    'VEHICLE_TAX': 'Impuesto de Vehículos',
    'URBAN_CLEANING': 'Aseo Urbano',
    'ADMINISTRATIVE': 'Tasa Administrativa',
    'SPACE_USE': 'Uso de Espacios',
    'CEMETERY': 'Cementerio',
    'PUBLIC_EVENTS': 'Eventos Públicos',
    'OTHER': 'Otros'
  };
  return names[type] || type;
}

function getPaymentMethodName(method) {
  const names = {
    'CASH': 'Efectivo',
    'TRANSFER': 'Transferencia',
    'MOBILE_PAYMENT': 'Pago Móvil',
    'POS': 'Punto de Venta',
    'CHECK': 'Cheque',
    'ONLINE': 'En Línea'
  };
  return names[method] || method;
}

function getBillStatusName(status) {
  const names = {
    'PENDING': 'Pendiente',
    'PARTIAL': 'Parcial',
    'PAID': 'Pagada',
    'OVERDUE': 'Vencida',
    'CANCELLED': 'Cancelada'
  };
  return names[status] || status;
}

function getSolvencyTypeName(type) {
  const names = {
    'GENERAL': 'General',
    'BUSINESS': 'Comercial',
    'PROPERTY': 'Inmobiliaria',
    'VEHICLE': 'Vehicular'
  };
  return names[type] || type;
}
