/**
 * Servicio para gestión de permisos de construcción
 */

import prisma from '../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../shared/utils/errors.js';

/**
 * Generar número de permiso único
 * @returns {Promise<string>}
 */
const generatePermitNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.constructionPermit.count({
    where: {
      permitNumber: {
        startsWith: `PC-${year}-`,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `PC-${year}-${nextNumber}`;
};

/**
 * Obtener todos los permisos con filtros
 * @param {Object} filters - Filtros
 * @returns {Promise<Object>}
 */
export const getAllPermits = async (filters = {}) => {
  const {
    search,
    status,
    permitType,
    propertyId,
    applicantId,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.OR = [
      { permitNumber: { contains: search, mode: 'insensitive' } },
      { applicantName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (permitType) where.permitType = permitType;
  if (propertyId) where.propertyId = propertyId;
  if (applicantId) where.applicantId = applicantId;

  const [permits, total] = await Promise.all([
    prisma.constructionPermit.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        property: {
          select: {
            id: true,
            cadastralCode: true,
            address: true,
            parish: true,
          },
        },
        _count: {
          select: {
            inspections: true,
          },
        },
      },
      orderBy: { applicationDate: 'desc' },
    }),
    prisma.constructionPermit.count({ where }),
  ]);

  return {
    permits,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtener permiso por ID
 * @param {string} id - ID del permiso
 * @returns {Promise<Object>}
 */
export const getPermitById = async (id) => {
  const permit = await prisma.constructionPermit.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          taxpayer: {
            select: {
              id: true,
              name: true,
              taxId: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      inspections: {
        orderBy: { inspectionDate: 'desc' },
      },
    },
  });

  if (!permit) {
    throw new NotFoundError('Permiso de construcción no encontrado');
  }

  return permit;
};

/**
 * Obtener permiso por número
 * @param {string} permitNumber - Número de permiso
 * @returns {Promise<Object>}
 */
export const getPermitByNumber = async (permitNumber) => {
  const permit = await prisma.constructionPermit.findUnique({
    where: { permitNumber },
    include: {
      property: true,
      inspections: true,
    },
  });

  if (!permit) {
    throw new NotFoundError('Permiso de construcción no encontrado');
  }

  return permit;
};

/**
 * Crear nuevo permiso de construcción
 * @param {Object} data - Datos del permiso
 * @returns {Promise<Object>}
 */
export const createPermit = async (data) => {
  // Verificar que la propiedad exista
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
  });

  if (!property) {
    throw new NotFoundError('Propiedad no encontrada');
  }

  // Generar número de permiso
  const permitNumber = await generatePermitNumber();

  // Crear el permiso
  const permit = await prisma.constructionPermit.create({
    data: {
      ...data,
      permitNumber,
      status: 'SUBMITTED',
    },
    include: {
      property: true,
    },
  });

  return permit;
};

/**
 * Actualizar permiso de construcción
 * @param {string} id - ID del permiso
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const updatePermit = async (id, data) => {
  const existing = await prisma.constructionPermit.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Permiso de construcción no encontrado');
  }

  const permit = await prisma.constructionPermit.update({
    where: { id },
    data,
    include: {
      property: true,
      inspections: true,
    },
  });

  return permit;
};

/**
 * Revisar permiso (revisión técnica)
 * @param {string} id - ID del permiso
 * @param {Object} reviewData - Datos de la revisión
 * @returns {Promise<Object>}
 */
export const reviewPermit = async (id, reviewData) => {
  const permit = await getPermitById(id);

  if (permit.status !== 'SUBMITTED' && permit.status !== 'CORRECTIONS_REQUIRED') {
    throw new ValidationError('El permiso no está en estado de revisión');
  }

  const updatedPermit = await prisma.constructionPermit.update({
    where: { id },
    data: {
      reviewerId: reviewData.reviewerId,
      reviewDate: new Date(),
      reviewNotes: reviewData.reviewNotes,
      complianceCheck: reviewData.complianceCheck,
      status: reviewData.complianceCheck ? 'UNDER_REVIEW' : 'CORRECTIONS_REQUIRED',
    },
    include: {
      property: true,
    },
  });

  return updatedPermit;
};

/**
 * Aprobar o rechazar permiso
 * @param {string} id - ID del permiso
 * @param {Object} approvalData - Datos de aprobación
 * @returns {Promise<Object>}
 */
export const approveOrRejectPermit = async (id, approvalData) => {
  const permit = await getPermitById(id);

  if (permit.status !== 'UNDER_REVIEW') {
    throw new ValidationError('El permiso no está en estado de revisión');
  }

  if (!permit.isPaid && approvalData.approved) {
    throw new ValidationError('El permiso debe estar pagado para ser aprobado');
  }

  const updatedPermit = await prisma.constructionPermit.update({
    where: { id },
    data: {
      approvedBy: approvalData.approvedBy,
      approvalDate: new Date(),
      approvalNotes: approvalData.approvalNotes,
      status: approvalData.approved ? 'APPROVED' : 'REJECTED',
      expiryDate: approvalData.approved
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        : undefined,
    },
    include: {
      property: true,
    },
  });

  return updatedPermit;
};

/**
 * Registrar pago de permiso
 * @param {string} id - ID del permiso
 * @param {Object} paymentData - Datos del pago
 * @returns {Promise<Object>}
 */
export const registerPayment = async (id, paymentData) => {
  const permit = await getPermitById(id);

  if (permit.isPaid) {
    throw new ValidationError('El permiso ya está pagado');
  }

  const updatedPermit = await prisma.constructionPermit.update({
    where: { id },
    data: {
      isPaid: true,
      paymentDate: paymentData.paymentDate || new Date(),
      paymentReference: paymentData.paymentReference,
    },
    include: {
      property: true,
    },
  });

  return updatedPermit;
};

/**
 * Iniciar construcción
 * @param {string} id - ID del permiso
 * @returns {Promise<Object>}
 */
export const startConstruction = async (id) => {
  const permit = await getPermitById(id);

  if (permit.status !== 'APPROVED') {
    throw new ValidationError('El permiso debe estar aprobado para iniciar construcción');
  }

  const updatedPermit = await prisma.constructionPermit.update({
    where: { id },
    data: {
      status: 'IN_CONSTRUCTION',
      constructionStartDate: new Date(),
    },
    include: {
      property: true,
    },
  });

  return updatedPermit;
};

/**
 * Finalizar construcción
 * @param {string} id - ID del permiso
 * @returns {Promise<Object>}
 */
export const completeConstruction = async (id) => {
  const permit = await getPermitById(id);

  if (permit.status !== 'IN_CONSTRUCTION') {
    throw new ValidationError('El permiso debe estar en construcción');
  }

  // Verificar que tenga al menos una inspección final aprobada
  const finalInspection = await prisma.permitInspection.findFirst({
    where: {
      permitId: id,
      inspectionType: 'FINAL',
      compliance: true,
      status: 'COMPLETED',
    },
  });

  if (!finalInspection) {
    throw new ValidationError(
      'Se requiere una inspección final aprobada para completar la construcción'
    );
  }

  const updatedPermit = await prisma.constructionPermit.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      constructionEndDate: new Date(),
    },
    include: {
      property: true,
    },
  });

  return updatedPermit;
};

/**
 * Cancelar permiso
 * @param {string} id - ID del permiso
 * @param {string} reason - Razón de cancelación
 * @returns {Promise<Object>}
 */
export const cancelPermit = async (id, reason) => {
  const permit = await getPermitById(id);

  if (permit.status === 'COMPLETED' || permit.status === 'CANCELLED') {
    throw new ValidationError('No se puede cancelar un permiso completado o ya cancelado');
  }

  const updatedPermit = await prisma.constructionPermit.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      notes: `${permit.notes || ''}\n\nCANCELADO: ${reason}`,
    },
    include: {
      property: true,
    },
  });

  return updatedPermit;
};

/**
 * Obtener estadísticas de permisos
 * @returns {Promise<Object>}
 */
export const getPermitStats = async () => {
  const [total, byStatus, byType, pending, inConstruction, completed] = await Promise.all([
    prisma.constructionPermit.count(),
    prisma.constructionPermit.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.constructionPermit.groupBy({
      by: ['permitType'],
      _count: true,
    }),
    prisma.constructionPermit.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
    }),
    prisma.constructionPermit.count({
      where: { status: 'IN_CONSTRUCTION' },
    }),
    prisma.constructionPermit.count({
      where: { status: 'COMPLETED' },
    }),
  ]);

  return {
    total,
    byStatus,
    byType,
    pending,
    inConstruction,
    completed,
  };
};
