/**
 * Servicio para gestión de Reportes Ciudadanos (Sistema 311)
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Genera número de ticket único para reporte
 * @returns {Promise<string>} Número de ticket (RP-2025-00001)
 */
async function generateTicketNumber() {
  const year = new Date().getFullYear();
  const prefix = `RP-${year}-`;
  
  // Buscar el último ticket del año
  const lastReport = await prisma.citizenReport.findFirst({
    where: {
      ticketNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastReport) {
    const lastNumber = parseInt(lastReport.ticketNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
}

/**
 * Determina el departamento responsable según el tipo de reporte
 * @param {string} reportType - Tipo de reporte
 * @returns {Promise<string|null>} ID del departamento o null
 */
async function determineDepartment(reportType) {
  // Mapeo de tipos de reporte a departamentos
  const departmentMapping = {
    POTHOLE: 'OBRAS',
    STREET_LIGHT: 'SERVICIOS_PUBLICOS',
    GARBAGE: 'ASEO_URBANO',
    WATER_LEAK: 'SERVICIOS_PUBLICOS',
    FALLEN_TREE: 'AMBIENTE',
    TRAFFIC_LIGHT: 'INGENIERIA',
    SEWER: 'SERVICIOS_PUBLICOS',
    PEST: 'AMBIENTE',
    NOISE: 'PROTECCION_CIVIL',
    DEAD_ANIMAL: 'ASEO_URBANO',
    ROAD_SIGN: 'INGENIERIA',
    SIDEWALK: 'OBRAS',
    PARK_MAINTENANCE: 'PARQUES'
  };
  
  const deptCode = departmentMapping[reportType];
  if (!deptCode) return null;
  
  // Buscar departamento por código (esto es un ejemplo, ajustar según estructura real)
  const department = await prisma.department.findFirst({
    where: {
      code: {
        contains: deptCode,
        mode: 'insensitive'
      }
    }
  });
  
  return department?.id || null;
}

/**
 * Determina la prioridad automática según el tipo de reporte
 * @param {string} reportType - Tipo de reporte
 * @returns {string} Prioridad (LOW, MEDIUM, HIGH, CRITICAL)
 */
function determinePriority(reportType) {
  const criticalTypes = ['WATER_LEAK', 'FALLEN_TREE', 'TRAFFIC_LIGHT'];
  const highTypes = ['POTHOLE', 'STREET_LIGHT', 'SEWER'];
  const mediumTypes = ['GARBAGE', 'DEAD_ANIMAL', 'ROAD_SIGN', 'SIDEWALK'];
  
  if (criticalTypes.includes(reportType)) return 'CRITICAL';
  if (highTypes.includes(reportType)) return 'HIGH';
  if (mediumTypes.includes(reportType)) return 'MEDIUM';
  return 'LOW';
}

/**
 * Crea un nuevo reporte ciudadano
 * @param {Object} data - Datos del reporte
 * @param {Object} files - Archivos adjuntos (fotos)
 * @returns {Promise<Object>} Reporte creado
 */
export async function createReport(data, files = []) {
  // Generar número de ticket único
  const ticketNumber = await generateTicketNumber();
  
  // Determinar departamento responsable automáticamente
  const departmentId = await determineDepartment(data.type);
  
  // Determinar prioridad automática
  const priority = determinePriority(data.type);
  
  // Crear el reporte
  const report = await prisma.citizenReport.create({
    data: {
      ticketNumber,
      type: data.type,
      customType: data.customType,
      title: data.title,
      description: data.description,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      sector: data.sector,
      reporterName: data.reporterName,
      reporterEmail: data.reporterEmail,
      reporterPhone: data.reporterPhone,
      reporterUserId: data.reporterUserId,
      isAnonymous: data.isAnonymous || false,
      isPublic: data.isPublic !== false,
      departmentId,
      priority,
      status: 'RECEIVED',
      receivedAt: new Date(),
      // Crear fotos si existen
      photos: files.length > 0 ? {
        create: files.map(file => ({
          url: file.url,
          caption: file.caption,
          type: 'BEFORE'
        }))
      } : undefined
    },
    include: {
      photos: true
    }
  });
  
  return report;
}

/**
 * Obtiene un reporte por ID
 * @param {string} id - ID del reporte
 * @returns {Promise<Object>} Reporte encontrado
 */
export async function getReportById(id) {
  const report = await prisma.citizenReport.findUnique({
    where: { id },
    include: {
      photos: true,
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  if (!report) {
    throw new AppError('Reporte no encontrado', 404);
  }
  
  return report;
}

/**
 * Obtiene un reporte por número de ticket
 * @param {string} ticketNumber - Número de ticket
 * @returns {Promise<Object>} Reporte encontrado
 */
export async function getReportByTicket(ticketNumber) {
  const report = await prisma.citizenReport.findUnique({
    where: { ticketNumber },
    include: {
      photos: true,
      comments: {
        where: { isInternal: false }, // Solo comentarios públicos
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  if (!report) {
    throw new AppError('Reporte no encontrado', 404);
  }
  
  return report;
}

/**
 * Lista reportes con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de reportes y metadata
 */
export async function listReports(filters = {}) {
  const {
    type,
    status,
    priority,
    sector,
    departmentId,
    assignedTo,
    startDate,
    endDate,
    page = 1,
    limit = 10
  } = filters;
  
  const where = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (sector) where.sector = sector;
  if (departmentId) where.departmentId = departmentId;
  if (assignedTo) where.assignedTo = assignedTo;
  
  if (startDate || endDate) {
    where.receivedAt = {};
    if (startDate) where.receivedAt.gte = new Date(startDate);
    if (endDate) where.receivedAt.lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [reports, total] = await Promise.all([
    prisma.citizenReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { receivedAt: 'desc' },
      include: {
        photos: {
          take: 1 // Solo primera foto para lista
        }
      }
    }),
    prisma.citizenReport.count({ where })
  ]);
  
  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Actualiza el estado de un reporte
 * @param {string} id - ID del reporte
 * @param {Object} data - Datos de actualización
 * @param {string} userId - ID del usuario que actualiza
 * @returns {Promise<Object>} Reporte actualizado
 */
export async function updateReportStatus(id, data, userId) {
  const report = await getReportById(id);
  
  const updateData = {
    status: data.status,
    resolutionNotes: data.resolutionNotes,
    updatedAt: new Date()
  };
  
  // Actualizar fechas según el estado
  switch (data.status) {
    case 'IN_REVIEW':
      updateData.reviewedAt = new Date();
      break;
    case 'IN_PROGRESS':
      updateData.inProgressAt = new Date();
      break;
    case 'RESOLVED':
      updateData.resolvedAt = new Date();
      break;
    case 'CLOSED':
      updateData.closedAt = new Date();
      break;
  }
  
  const updatedReport = await prisma.citizenReport.update({
    where: { id },
    data: updateData,
    include: {
      photos: true,
      comments: true
    }
  });
  
  return updatedReport;
}

/**
 * Asigna un reporte a un departamento o usuario
 * @param {string} id - ID del reporte
 * @param {Object} data - Datos de asignación
 * @returns {Promise<Object>} Reporte actualizado
 */
export async function assignReport(id, data) {
  const report = await getReportById(id);
  
  const updateData = {
    assignedAt: new Date(),
    status: 'ASSIGNED'
  };
  
  if (data.departmentId) updateData.departmentId = data.departmentId;
  if (data.assignedTo) updateData.assignedTo = data.assignedTo;
  if (data.priority) updateData.priority = data.priority;
  
  const updatedReport = await prisma.citizenReport.update({
    where: { id },
    data: updateData,
    include: {
      photos: true
    }
  });
  
  return updatedReport;
}

/**
 * Agrega un comentario a un reporte
 * @param {string} reportId - ID del reporte
 * @param {Object} data - Datos del comentario
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} Comentario creado
 */
export async function addComment(reportId, data, userId = null) {
  await getReportById(reportId); // Verificar que existe
  
  const comment = await prisma.reportComment.create({
    data: {
      reportId,
      authorId: userId,
      authorName: data.authorName,
      comment: data.comment,
      isInternal: data.isInternal || false
    }
  });
  
  return comment;
}

/**
 * Califica el servicio de un reporte resuelto
 * @param {string} id - ID del reporte
 * @param {Object} data - Datos de calificación
 * @returns {Promise<Object>} Reporte actualizado
 */
export async function rateReport(id, data) {
  const report = await getReportById(id);
  
  if (report.status !== 'RESOLVED' && report.status !== 'CLOSED') {
    throw new AppError('Solo se pueden calificar reportes resueltos o cerrados', 400);
  }
  
  const updatedReport = await prisma.citizenReport.update({
    where: { id },
    data: {
      rating: data.rating,
      ratingComment: data.ratingComment,
      ratedAt: new Date()
    }
  });
  
  return updatedReport;
}

/**
 * Obtiene estadísticas de reportes
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Estadísticas
 */
export async function getReportsStats(filters = {}) {
  const where = {};
  
  if (filters.startDate || filters.endDate) {
    where.receivedAt = {};
    if (filters.startDate) where.receivedAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.receivedAt.lte = new Date(filters.endDate);
  }
  
  const [
    totalReports,
    byStatus,
    byType,
    byPriority,
    avgRating,
    avgResolutionTime
  ] = await Promise.all([
    // Total de reportes
    prisma.citizenReport.count({ where }),
    
    // Por estado
    prisma.citizenReport.groupBy({
      by: ['status'],
      where,
      _count: true
    }),
    
    // Por tipo
    prisma.citizenReport.groupBy({
      by: ['type'],
      where,
      _count: true,
      orderBy: {
        _count: {
          type: 'desc'
        }
      },
      take: 10
    }),
    
    // Por prioridad
    prisma.citizenReport.groupBy({
      by: ['priority'],
      where,
      _count: true
    }),
    
    // Calificación promedio
    prisma.citizenReport.aggregate({
      where: {
        ...where,
        rating: { not: null }
      },
      _avg: {
        rating: true
      }
    }),
    
    // Tiempo promedio de resolución (en días)
    prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - received_at)) / 86400) as avg_days
      FROM citizen_reports
      WHERE resolved_at IS NOT NULL
      ${filters.startDate ? prisma.$queryRaw`AND received_at >= ${new Date(filters.startDate)}` : prisma.$queryRaw``}
      ${filters.endDate ? prisma.$queryRaw`AND received_at <= ${new Date(filters.endDate)}` : prisma.$queryRaw``}
    `
  ]);
  
  return {
    total: totalReports,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byType: byType.map(item => ({
      type: item.type,
      count: item._count
    })),
    byPriority: byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {}),
    avgRating: avgRating._avg.rating || 0,
    avgResolutionDays: avgResolutionTime[0]?.avg_days || 0
  };
}

/**
 * Obtiene datos para mapa de calor
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Reportes con coordenadas
 */
export async function getHeatmapData(filters = {}) {
  const where = {
    latitude: { not: null },
    longitude: { not: null },
    isPublic: true
  };
  
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.sector) where.sector = filters.sector;
  
  if (filters.startDate || filters.endDate) {
    where.receivedAt = {};
    if (filters.startDate) where.receivedAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.receivedAt.lte = new Date(filters.endDate);
  }
  
  const reports = await prisma.citizenReport.findMany({
    where,
    select: {
      id: true,
      ticketNumber: true,
      type: true,
      title: true,
      latitude: true,
      longitude: true,
      status: true,
      priority: true,
      receivedAt: true
    }
  });
  
  return reports;
}

/**
 * Elimina un reporte (solo SUPER_ADMIN)
 * @param {string} id - ID del reporte
 * @returns {Promise<void>}
 */
export async function deleteReport(id) {
  await getReportById(id); // Verificar que existe
  
  await prisma.citizenReport.delete({
    where: { id }
  });
}
