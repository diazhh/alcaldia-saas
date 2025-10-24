/**
 * Servicio para gestión de inspecciones urbanas (control urbano)
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Generar número de inspección urbana único
 * @returns {Promise<string>}
 */
const generateInspectionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.urbanInspection.count({
    where: {
      inspectionNumber: {
        startsWith: `IU-${year}-`,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `IU-${year}-${nextNumber}`;
};

/**
 * Obtener todas las inspecciones urbanas con filtros
 * @param {Object} filters - Filtros
 * @returns {Promise<Object>}
 */
export const getAllUrbanInspections = async (filters = {}) => {
  const {
    search,
    status,
    inspectionType,
    origin,
    hasViolation,
    inspectorId,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.OR = [
      { inspectionNumber: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (inspectionType) where.inspectionType = inspectionType;
  if (origin) where.origin = origin;
  if (hasViolation !== undefined) where.hasViolation = hasViolation === 'true';
  if (inspectorId) where.inspectorId = inspectorId;

  const [inspections, total] = await Promise.all([
    prisma.urbanInspection.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        property: {
          select: {
            id: true,
            cadastralCode: true,
            address: true,
            taxpayer: {
              select: {
                firstName: true,
                lastName: true,
                businessName: true,
                taxId: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.urbanInspection.count({ where }),
  ]);

  return {
    inspections,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtener inspección urbana por ID
 * @param {string} id - ID de la inspección
 * @returns {Promise<Object>}
 */
export const getUrbanInspectionById = async (id) => {
  const inspection = await prisma.urbanInspection.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          taxpayer: true,
        },
      },
    },
  });

  if (!inspection) {
    throw new NotFoundError('Inspección urbana no encontrada');
  }

  return inspection;
};

/**
 * Obtener inspección por número
 * @param {string} inspectionNumber - Número de inspección
 * @returns {Promise<Object>}
 */
export const getUrbanInspectionByNumber = async (inspectionNumber) => {
  const inspection = await prisma.urbanInspection.findUnique({
    where: { inspectionNumber },
    include: {
      property: true,
    },
  });

  if (!inspection) {
    throw new NotFoundError('Inspección urbana no encontrada');
  }

  return inspection;
};

/**
 * Crear nueva inspección urbana
 * @param {Object} data - Datos de la inspección
 * @returns {Promise<Object>}
 */
export const createUrbanInspection = async (data) => {
  // Si se proporciona propertyId, verificar que exista
  if (data.propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      throw new NotFoundError('Propiedad no encontrada');
    }
  }

  // Generar número de inspección
  const inspectionNumber = await generateInspectionNumber();

  const inspection = await prisma.urbanInspection.create({
    data: {
      ...data,
      inspectionNumber,
      status: 'SCHEDULED',
    },
    include: {
      property: true,
    },
  });

  return inspection;
};

/**
 * Actualizar inspección urbana
 * @param {string} id - ID de la inspección
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const updateUrbanInspection = async (id, data) => {
  const existing = await prisma.urbanInspection.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Inspección urbana no encontrada');
  }

  const inspection = await prisma.urbanInspection.update({
    where: { id },
    data,
    include: {
      property: true,
    },
  });

  return inspection;
};

/**
 * Eliminar inspección urbana
 * @param {string} id - ID de la inspección
 * @returns {Promise<void>}
 */
export const deleteUrbanInspection = async (id) => {
  const inspection = await prisma.urbanInspection.findUnique({
    where: { id },
  });

  if (!inspection) {
    throw new NotFoundError('Inspección urbana no encontrada');
  }

  await prisma.urbanInspection.delete({
    where: { id },
  });
};

/**
 * Registrar notificación de inspección
 * @param {string} id - ID de la inspección
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Promise<Object>}
 */
export const registerNotification = async (id, notificationData) => {
  const inspection = await getUrbanInspectionById(id);

  const updated = await prisma.urbanInspection.update({
    where: { id },
    data: {
      notificationSent: true,
      notificationDate: notificationData.notificationDate || new Date(),
      notificationMethod: notificationData.notificationMethod,
      status: 'NOTIFIED',
    },
    include: {
      property: true,
    },
  });

  return updated;
};

/**
 * Registrar sanción
 * @param {string} id - ID de la inspección
 * @param {Object} sanctionData - Datos de la sanción
 * @returns {Promise<Object>}
 */
export const registerSanction = async (id, sanctionData) => {
  const inspection = await getUrbanInspectionById(id);

  const updated = await prisma.urbanInspection.update({
    where: { id },
    data: {
      hasSanction: true,
      sanctionType: sanctionData.sanctionType,
      sanctionAmount: sanctionData.sanctionAmount,
      sanctionDetails: sanctionData.sanctionDetails,
      status: 'SANCTIONED',
    },
    include: {
      property: true,
    },
  });

  return updated;
};

/**
 * Resolver inspección
 * @param {string} id - ID de la inspección
 * @param {string} resolutionNotes - Notas de resolución
 * @returns {Promise<Object>}
 */
export const resolveInspection = async (id, resolutionNotes) => {
  const inspection = await getUrbanInspectionById(id);

  const updated = await prisma.urbanInspection.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolutionDate: new Date(),
      resolutionNotes,
    },
    include: {
      property: true,
    },
  });

  return updated;
};

/**
 * Obtener inspecciones de una propiedad
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<Array>}
 */
export const getInspectionsByProperty = async (propertyId) => {
  const inspections = await prisma.urbanInspection.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
  });

  return inspections;
};

/**
 * Obtener estadísticas de inspecciones urbanas
 * @returns {Promise<Object>}
 */
export const getUrbanInspectionStats = async () => {
  const [
    total,
    byStatus,
    byType,
    byOrigin,
    withViolations,
    withSanctions,
    pending,
  ] = await Promise.all([
    prisma.urbanInspection.count(),
    prisma.urbanInspection.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.urbanInspection.groupBy({
      by: ['inspectionType'],
      _count: true,
    }),
    prisma.urbanInspection.groupBy({
      by: ['origin'],
      _count: true,
    }),
    prisma.urbanInspection.count({
      where: { hasViolation: true },
    }),
    prisma.urbanInspection.count({
      where: { hasSanction: true },
    }),
    prisma.urbanInspection.count({
      where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
    }),
  ]);

  return {
    total,
    byStatus,
    byType,
    byOrigin,
    withViolations,
    withSanctions,
    pending,
  };
};
