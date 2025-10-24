/**
 * Controlador de Reportes Tributarios
 * Maneja la generación y descarga de reportes en PDF, Excel y CSV
 */

import {
  generatePDFReport,
  generateExcelReport,
  generateCSVReport
} from '../services/reports.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Genera un reporte en el formato especificado
 * GET /api/tax/reports/:reportType
 * Query params: period (YYYY, YYYY-MM, YYYY-QN), format (pdf, excel, csv)
 */
export const generateReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { period, format = 'pdf' } = req.query;

    // Validar tipo de reporte
    const validReportTypes = [
      'collection',
      'defaulters',
      'taxpayers',
      'solvencies',
      'efficiency',
      'business-licenses'
    ];

    if (!validReportTypes.includes(reportType)) {
      return errorResponse(res, 'Tipo de reporte inválido', 400);
    }

    // Validar formato
    const validFormats = ['pdf', 'excel', 'csv'];
    if (!validFormats.includes(format)) {
      return errorResponse(res, 'Formato inválido. Use: pdf, excel, o csv', 400);
    }

    // Validar período si se proporciona
    if (period && !isValidPeriod(period)) {
      return errorResponse(res, 'Período inválido. Use: YYYY, YYYY-MM, o YYYY-QN', 400);
    }

    // Generar nombre de archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const periodStr = period || 'all';
    const fileName = `${reportType}_${periodStr}_${timestamp}`;

    let buffer;
    let contentType;
    let fileExtension;

    // Generar reporte según formato
    switch (format) {
      case 'pdf':
        buffer = await generatePDFReport(reportType, period);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;

      case 'excel':
        buffer = await generateExcelReport(reportType, period);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;

      case 'csv':
        buffer = await generateCSVReport(reportType, period);
        contentType = 'text/csv; charset=utf-8';
        fileExtension = 'csv';
        break;
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.${fileExtension}"`);
    res.setHeader('Content-Length', buffer.length);

    // Enviar archivo
    res.send(buffer);

  } catch (error) {
    console.error('Error generando reporte:', error);
    return errorResponse(res, 'Error al generar el reporte', 500, error.message);
  }
};

/**
 * Obtiene lista de tipos de reportes disponibles
 * GET /api/tax/reports/types
 */
export const getReportTypes = async (req, res) => {
  try {
    const reportTypes = [
      {
        id: 'collection',
        name: 'Reporte de Recaudación',
        description: 'Detalle de recaudación por período y tipo de impuesto',
        formats: ['pdf', 'excel', 'csv'],
        requiresPeriod: true
      },
      {
        id: 'defaulters',
        name: 'Cartera de Morosos',
        description: 'Listado de contribuyentes con deudas pendientes',
        formats: ['pdf', 'excel', 'csv'],
        requiresPeriod: false
      },
      {
        id: 'taxpayers',
        name: 'Registro de Contribuyentes',
        description: 'Base de datos de contribuyentes activos e inactivos',
        formats: ['pdf', 'excel', 'csv'],
        requiresPeriod: false
      },
      {
        id: 'solvencies',
        name: 'Solvencias Emitidas',
        description: 'Listado de certificados de solvencia emitidos',
        formats: ['pdf', 'excel', 'csv'],
        requiresPeriod: true
      },
      {
        id: 'efficiency',
        name: 'Indicadores de Eficiencia',
        description: 'KPIs y métricas de gestión tributaria',
        formats: ['pdf', 'excel', 'csv'],
        requiresPeriod: true
      },
      {
        id: 'business-licenses',
        name: 'Patentes Comerciales',
        description: 'Registro de licencias de actividades económicas',
        formats: ['pdf', 'excel', 'csv'],
        requiresPeriod: false
      }
    ];

    return successResponse(res, reportTypes, 'Tipos de reportes obtenidos exitosamente');
  } catch (error) {
    console.error('Error obteniendo tipos de reportes:', error);
    return errorResponse(res, 'Error al obtener tipos de reportes', 500, error.message);
  }
};

/**
 * Vista previa de datos del reporte (JSON)
 * GET /api/tax/reports/:reportType/preview
 */
export const previewReportData = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { period, limit = 10 } = req.query;

    // Validar tipo de reporte
    const validReportTypes = [
      'collection',
      'defaulters',
      'taxpayers',
      'solvencies',
      'efficiency',
      'business-licenses'
    ];

    if (!validReportTypes.includes(reportType)) {
      return errorResponse(res, 'Tipo de reporte inválido', 400);
    }

    // Importar dinámicamente la función de obtención de datos
    let data;
    const {
      getCollectionData,
      getDefaultersData,
      getTaxpayersData,
      getSolvenciesData,
      getEfficiencyData,
      getBusinessLicensesData
    } = await import('../services/reports.service.js');

    switch (reportType) {
      case 'collection':
        data = await getCollectionData(period);
        break;
      case 'defaulters':
        data = await getDefaultersData();
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
    }

    // Limitar resultados para preview
    if (Array.isArray(data) && data.length > limit) {
      data = data.slice(0, limit);
    }

    return successResponse(res, {
      reportType,
      period: period || 'all',
      preview: true,
      limit,
      data
    }, 'Vista previa generada exitosamente');

  } catch (error) {
    console.error('Error generando vista previa:', error);
    return errorResponse(res, 'Error al generar vista previa', 500, error.message);
  }
};

/**
 * Obtiene estadísticas sobre reportes generados
 * GET /api/tax/reports/stats
 */
export const getReportStats = async (req, res) => {
  try {
    // En una implementación futura, podríamos trackear reportes generados
    // Por ahora, retornamos información básica
    const stats = {
      availableReports: 6,
      supportedFormats: ['pdf', 'excel', 'csv'],
      lastGenerated: new Date().toISOString(),
      message: 'Sistema de reportes operativo'
    };

    return successResponse(res, stats, 'Estadísticas de reportes obtenidas');
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return errorResponse(res, 'Error al obtener estadísticas', 500, error.message);
  }
};

/**
 * Helper: Valida formato de período
 */
function isValidPeriod(period) {
  if (!period) return true;

  // YYYY
  if (/^\d{4}$/.test(period)) return true;

  // YYYY-MM
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return true;

  // YYYY-Q[1-4]
  if (/^\d{4}-Q[1-4]$/.test(period)) return true;

  return false;
}
