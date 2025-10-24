import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un código único para el reporte
 * Formato: REP-PROJECTCODE-NNN (ej: REP-PRO-2025-001-001)
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<string>} Código generado
 */
export const generateReportNumber = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { code: true },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  const prefix = `REP-${project.code}-`;

  // Obtener el último reporte del proyecto
  const lastReport = await prisma.progressReport.findFirst({
    where: {
      reportNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      reportNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastReport) {
    const lastNumber = parseInt(lastReport.reportNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }

  // Formatear con ceros a la izquierda (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${formattedNumber}`;
};

/**
 * Crea un nuevo reporte de avance
 * @param {string} projectId - ID del proyecto
 * @param {Object} reportData - Datos del reporte
 * @param {string} userId - ID del usuario que crea el reporte
 * @returns {Promise<Object>} Reporte creado
 */
export const createProgressReport = async (projectId, reportData, userId) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Generar número único de reporte
  const reportNumber = await generateReportNumber(projectId);

  // Convertir fechas si vienen como strings
  const dataToCreate = { ...reportData };
  if (dataToCreate.reportDate) {
    dataToCreate.reportDate = new Date(dataToCreate.reportDate);
  }
  if (dataToCreate.periodStart) {
    dataToCreate.periodStart = new Date(dataToCreate.periodStart);
  }
  if (dataToCreate.periodEnd) {
    dataToCreate.periodEnd = new Date(dataToCreate.periodEnd);
  }

  // Calcular variación
  const variance = dataToCreate.physicalProgress - dataToCreate.plannedProgress;

  const report = await prisma.progressReport.create({
    data: {
      ...dataToCreate,
      projectId,
      reportNumber,
      reportedBy: userId,
      variance,
    },
    include: {
      reporter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  // Actualizar el avance del proyecto
  await prisma.project.update({
    where: { id: projectId },
    data: {
      actualProgress: dataToCreate.physicalProgress,
    },
  });

  return report;
};

/**
 * Obtiene reportes de un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados por página (default: 10)
 * @returns {Promise<Object>} Lista de reportes y metadata de paginación
 */
export const getReportsByProject = async (projectId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.progressReport.findMany({
      where: { projectId },
      skip,
      take: limit,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        reportDate: 'desc',
      },
    }),
    prisma.progressReport.count({ where: { projectId } }),
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene un reporte por ID
 * @param {string} reportId - ID del reporte
 * @returns {Promise<Object>} Reporte encontrado
 */
export const getReportById = async (reportId) => {
  const report = await prisma.progressReport.findUnique({
    where: { id: reportId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
          budget: true,
          status: true,
        },
      },
      reporter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!report) {
    throw new Error('Reporte no encontrado');
  }

  return report;
};

/**
 * Actualiza un reporte de avance
 * @param {string} reportId - ID del reporte
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Reporte actualizado
 */
export const updateProgressReport = async (reportId, updateData) => {
  const existingReport = await prisma.progressReport.findUnique({
    where: { id: reportId },
  });

  if (!existingReport) {
    throw new Error('Reporte no encontrado');
  }

  // Convertir fechas si vienen como strings
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.reportDate) {
    dataToUpdate.reportDate = new Date(dataToUpdate.reportDate);
  }
  if (dataToUpdate.periodStart) {
    dataToUpdate.periodStart = new Date(dataToUpdate.periodStart);
  }
  if (dataToUpdate.periodEnd) {
    dataToUpdate.periodEnd = new Date(dataToUpdate.periodEnd);
  }

  // Recalcular variación si cambia el avance
  if (dataToUpdate.physicalProgress !== undefined || dataToUpdate.plannedProgress !== undefined) {
    const physicalProgress = dataToUpdate.physicalProgress !== undefined
      ? dataToUpdate.physicalProgress
      : existingReport.physicalProgress;
    const plannedProgress = dataToUpdate.plannedProgress !== undefined
      ? dataToUpdate.plannedProgress
      : existingReport.plannedProgress;

    dataToUpdate.variance = physicalProgress - plannedProgress;
  }

  const report = await prisma.progressReport.update({
    where: { id: reportId },
    data: dataToUpdate,
    include: {
      reporter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Actualizar el avance del proyecto si cambió el avance físico
  if (dataToUpdate.physicalProgress !== undefined) {
    await prisma.project.update({
      where: { id: existingReport.projectId },
      data: {
        actualProgress: dataToUpdate.physicalProgress,
      },
    });
  }

  return report;
};

/**
 * Elimina un reporte de avance
 * @param {string} reportId - ID del reporte
 * @returns {Promise<Object>} Reporte eliminado
 */
export const deleteProgressReport = async (reportId) => {
  const existingReport = await prisma.progressReport.findUnique({
    where: { id: reportId },
  });

  if (!existingReport) {
    throw new Error('Reporte no encontrado');
  }

  const report = await prisma.progressReport.delete({
    where: { id: reportId },
  });

  return report;
};

/**
 * Obtiene el último reporte de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Último reporte
 */
export const getLatestReport = async (projectId) => {
  const report = await prisma.progressReport.findFirst({
    where: { projectId },
    include: {
      reporter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      reportDate: 'desc',
    },
  });

  return report;
};

/**
 * Obtiene estadísticas de reportes de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Estadísticas
 */
export const getReportStats = async (projectId) => {
  const reports = await prisma.progressReport.findMany({
    where: { projectId },
    orderBy: {
      reportDate: 'asc',
    },
  });

  if (reports.length === 0) {
    return {
      totalReports: 0,
      averageVariance: 0,
      totalExecutedAmount: 0,
      progressTrend: [],
    };
  }

  const totalExecutedAmount = reports[reports.length - 1].accumulatedAmount;
  const averageVariance = reports.reduce((sum, r) => sum + r.variance, 0) / reports.length;

  const progressTrend = reports.map(r => ({
    date: r.reportDate,
    physicalProgress: r.physicalProgress,
    plannedProgress: r.plannedProgress,
    variance: r.variance,
  }));

  return {
    totalReports: reports.length,
    averageVariance: Math.round(averageVariance),
    totalExecutedAmount: parseFloat(totalExecutedAmount),
    progressTrend,
  };
};
