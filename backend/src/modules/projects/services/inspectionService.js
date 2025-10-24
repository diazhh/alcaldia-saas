import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un código único para la inspección
 * Formato: INSP-YYYY-NNN (ej: INSP-2025-001)
 * @returns {Promise<string>} Código generado
 */
export const generateInspectionNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INSP-${year}-`;

  // Obtener la última inspección del año
  const lastInspection = await prisma.projectInspection.findFirst({
    where: {
      inspectionNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      inspectionNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastInspection) {
    const lastNumber = parseInt(lastInspection.inspectionNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Formatear con ceros a la izquierda (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${formattedNumber}`;
};

/**
 * Crea una nueva inspección
 * @param {string} projectId - ID del proyecto
 * @param {Object} inspectionData - Datos de la inspección
 * @param {string} inspectorId - ID del usuario inspector
 * @returns {Promise<Object>} Inspección creada
 */
export const createInspection = async (projectId, inspectionData, inspectorId) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Generar número único de inspección
  const inspectionNumber = await generateInspectionNumber();

  // Convertir fechas si vienen como strings
  const dataToCreate = { ...inspectionData };
  if (dataToCreate.scheduledDate) {
    dataToCreate.scheduledDate = new Date(dataToCreate.scheduledDate);
  }
  if (dataToCreate.completedDate) {
    dataToCreate.completedDate = new Date(dataToCreate.completedDate);
  }
  if (dataToCreate.followUpDate) {
    dataToCreate.followUpDate = new Date(dataToCreate.followUpDate);
  }

  const inspection = await prisma.projectInspection.create({
    data: {
      ...dataToCreate,
      projectId,
      inspectorId,
      inspectionNumber,
    },
    include: {
      inspector: {
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

  return inspection;
};

/**
 * Obtiene inspecciones con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados por página (default: 10)
 * @returns {Promise<Object>} Lista de inspecciones y metadata de paginación
 */
export const getInspections = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Construir el objeto where para filtros
  const where = {};

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters.inspectorId) {
    where.inspectorId = filters.inspectorId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.result) {
    where.result = filters.result;
  }

  if (filters.search) {
    where.OR = [
      { inspectionNumber: { contains: filters.search, mode: 'insensitive' } },
      { observations: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Obtener inspecciones y total
  const [inspections, total] = await Promise.all([
    prisma.projectInspection.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
        inspector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    }),
    prisma.projectInspection.count({ where }),
  ]);

  return {
    inspections,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene inspecciones de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} Lista de inspecciones
 */
export const getInspectionsByProject = async (projectId) => {
  const inspections = await prisma.projectInspection.findMany({
    where: { projectId },
    include: {
      inspector: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      scheduledDate: 'desc',
    },
  });

  return inspections;
};

/**
 * Obtiene una inspección por ID
 * @param {string} inspectionId - ID de la inspección
 * @returns {Promise<Object>} Inspección encontrada
 */
export const getInspectionById = async (inspectionId) => {
  const inspection = await prisma.projectInspection.findUnique({
    where: { id: inspectionId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          location: true,
        },
      },
      inspector: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!inspection) {
    throw new Error('Inspección no encontrada');
  }

  return inspection;
};

/**
 * Actualiza una inspección
 * @param {string} inspectionId - ID de la inspección
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Inspección actualizada
 */
export const updateInspection = async (inspectionId, updateData) => {
  const existingInspection = await prisma.projectInspection.findUnique({
    where: { id: inspectionId },
  });

  if (!existingInspection) {
    throw new Error('Inspección no encontrada');
  }

  // Convertir fechas si vienen como strings
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.scheduledDate) {
    dataToUpdate.scheduledDate = new Date(dataToUpdate.scheduledDate);
  }
  if (dataToUpdate.completedDate) {
    dataToUpdate.completedDate = new Date(dataToUpdate.completedDate);
  }
  if (dataToUpdate.followUpDate) {
    dataToUpdate.followUpDate = new Date(dataToUpdate.followUpDate);
  }

  const inspection = await prisma.projectInspection.update({
    where: { id: inspectionId },
    data: dataToUpdate,
    include: {
      inspector: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return inspection;
};

/**
 * Elimina una inspección
 * @param {string} inspectionId - ID de la inspección
 * @returns {Promise<Object>} Inspección eliminada
 */
export const deleteInspection = async (inspectionId) => {
  const existingInspection = await prisma.projectInspection.findUnique({
    where: { id: inspectionId },
  });

  if (!existingInspection) {
    throw new Error('Inspección no encontrada');
  }

  // Solo permitir eliminar inspecciones programadas
  if (existingInspection.status !== 'PROGRAMADA') {
    throw new Error('Solo se pueden eliminar inspecciones en estado PROGRAMADA');
  }

  const inspection = await prisma.projectInspection.delete({
    where: { id: inspectionId },
  });

  return inspection;
};

/**
 * Completa una inspección
 * @param {string} inspectionId - ID de la inspección
 * @param {Object} completionData - Datos de finalización (result, observations, etc.)
 * @returns {Promise<Object>} Inspección actualizada
 */
export const completeInspection = async (inspectionId, completionData) => {
  const inspection = await prisma.projectInspection.update({
    where: { id: inspectionId },
    data: {
      ...completionData,
      status: 'REALIZADA',
      completedDate: new Date(),
    },
    include: {
      inspector: {
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

  return inspection;
};

/**
 * Obtiene estadísticas de inspecciones
 * @param {string} projectId - ID del proyecto (opcional)
 * @returns {Promise<Object>} Estadísticas
 */
export const getInspectionStats = async (projectId = null) => {
  const where = projectId ? { projectId } : {};

  const [
    total,
    byStatus,
    byType,
    byResult,
  ] = await Promise.all([
    prisma.projectInspection.count({ where }),

    prisma.projectInspection.groupBy({
      by: ['status'],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.projectInspection.groupBy({
      by: ['type'],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.projectInspection.groupBy({
      by: ['result'],
      where: {
        ...where,
        result: { not: null },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.map(item => ({
      status: item.status,
      count: item._count._all,
    })),
    byType: byType.map(item => ({
      type: item.type,
      count: item._count._all,
    })),
    byResult: byResult.map(item => ({
      result: item.result,
      count: item._count._all,
    })),
  };
};
