/**
 * Servicio de Correspondencia
 * Gestiona la correspondencia de entrada y salida
 */

import prisma from '../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../shared/utils/errors.js';

/**
 * Genera el número de referencia para correspondencia
 * @param {string} type - ENTRADA o SALIDA
 * @returns {Promise<string>} Número de referencia generado
 */
async function generateReference(type) {
  const year = new Date().getFullYear();
  const prefix = type === 'ENTRADA' ? 'ME' : 'MS';
  
  // Obtener el último número del año actual
  const lastCorrespondence = await prisma.correspondence.findFirst({
    where: {
      type,
      reference: {
        startsWith: `${prefix}-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastCorrespondence) {
    const lastNumber = parseInt(lastCorrespondence.reference.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // Formato: ME-2025-001234 o MS-2025-000456
  return `${prefix}-${year}-${nextNumber.toString().padStart(6, '0')}`;
}

/**
 * Genera código QR para rastreo
 * @param {string} reference - Referencia de la correspondencia
 * @returns {string} Código QR (en producción sería una URL o hash)
 */
function generateQRCode(reference) {
  // En producción, esto generaría un código QR real
  // Por ahora, retornamos un identificador único
  return `QR-${reference}-${Date.now()}`;
}

/**
 * Crear correspondencia de entrada
 * @param {Object} data - Datos de la correspondencia
 * @param {string} userId - ID del usuario que registra
 * @returns {Promise<Object>} Correspondencia creada
 */
async function createIncomingCorrespondence(data, userId) {
  const reference = await generateReference('ENTRADA');
  const qrCode = generateQRCode(reference);
  
  const correspondence = await prisma.correspondence.create({
    data: {
      reference,
      type: 'ENTRADA',
      qrCode,
      receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
      registeredBy: userId,
      ...data,
      status: 'RECEIVED',
    },
  });
  
  return correspondence;
}

/**
 * Crear correspondencia de salida
 * @param {Object} data - Datos de la correspondencia
 * @param {string} userId - ID del usuario que registra
 * @returns {Promise<Object>} Correspondencia creada
 */
async function createOutgoingCorrespondence(data, userId) {
  const reference = await generateReference('SALIDA');
  
  const correspondence = await prisma.correspondence.create({
    data: {
      reference,
      type: 'SALIDA',
      sentDate: data.sentDate ? new Date(data.sentDate) : new Date(),
      registeredBy: userId,
      ...data,
      status: 'RECEIVED', // Cambiará cuando se despache
    },
  });
  
  return correspondence;
}

/**
 * Obtener correspondencia por ID
 * @param {string} id - ID de la correspondencia
 * @returns {Promise<Object>} Correspondencia encontrada
 */
async function getCorrespondenceById(id) {
  const correspondence = await prisma.correspondence.findUnique({
    where: { id },
  });
  
  if (!correspondence) {
    throw new NotFoundError('Correspondencia no encontrada');
  }
  
  return correspondence;
}

/**
 * Obtener correspondencia por referencia
 * @param {string} reference - Referencia de la correspondencia
 * @returns {Promise<Object>} Correspondencia encontrada
 */
async function getCorrespondenceByReference(reference) {
  const correspondence = await prisma.correspondence.findUnique({
    where: { reference },
  });
  
  if (!correspondence) {
    throw new NotFoundError('Correspondencia no encontrada');
  }
  
  return correspondence;
}

/**
 * Listar correspondencia con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de correspondencia y metadatos
 */
async function listCorrespondence(filters = {}) {
  const {
    type,
    status,
    priority,
    destinationDept,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  
  const where = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (destinationDept) where.destinationDept = destinationDept;
  
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { senderName: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { recipientName: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (startDate || endDate) {
    where.receivedDate = {};
    if (startDate) where.receivedDate.gte = new Date(startDate);
    if (endDate) where.receivedDate.lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [correspondences, total] = await Promise.all([
    prisma.correspondence.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.correspondence.count({ where }),
  ]);
  
  return {
    data: correspondences,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar correspondencia
 * @param {string} id - ID de la correspondencia
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Correspondencia actualizada
 */
async function updateCorrespondence(id, data) {
  const correspondence = await getCorrespondenceById(id);
  
  const updated = await prisma.correspondence.update({
    where: { id },
    data,
  });
  
  return updated;
}

/**
 * Marcar correspondencia como entregada
 * @param {string} id - ID de la correspondencia
 * @param {Object} deliveryData - Datos de entrega
 * @returns {Promise<Object>} Correspondencia actualizada
 */
async function markAsDelivered(id, deliveryData) {
  const correspondence = await getCorrespondenceById(id);
  
  if (correspondence.type !== 'ENTRADA') {
    throw new ValidationError('Solo la correspondencia de entrada puede marcarse como entregada');
  }
  
  const updated = await prisma.correspondence.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
      receivedBy: deliveryData.receivedBy,
    },
  });
  
  return updated;
}

/**
 * Marcar correspondencia como despachada (para salida)
 * @param {string} id - ID de la correspondencia
 * @param {Object} dispatchData - Datos de despacho
 * @returns {Promise<Object>} Correspondencia actualizada
 */
async function markAsDispatched(id, dispatchData) {
  const correspondence = await getCorrespondenceById(id);
  
  if (correspondence.type !== 'SALIDA') {
    throw new ValidationError('Solo la correspondencia de salida puede despacharse');
  }
  
  const updated = await prisma.correspondence.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
      deliveryMethod: dispatchData.deliveryMethod,
      trackingNumber: dispatchData.trackingNumber,
    },
  });
  
  return updated;
}

/**
 * Archivar correspondencia
 * @param {string} id - ID de la correspondencia
 * @returns {Promise<Object>} Correspondencia archivada
 */
async function archiveCorrespondence(id) {
  const correspondence = await getCorrespondenceById(id);
  
  const updated = await prisma.correspondence.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
    },
  });
  
  return updated;
}

/**
 * Eliminar correspondencia
 * @param {string} id - ID de la correspondencia
 * @returns {Promise<void>}
 */
async function deleteCorrespondence(id) {
  await getCorrespondenceById(id);
  
  await prisma.correspondence.delete({
    where: { id },
  });
}

/**
 * Obtener estadísticas de correspondencia
 * @param {Object} filters - Filtros para estadísticas
 * @returns {Promise<Object>} Estadísticas
 */
async function getCorrespondenceStats(filters = {}) {
  const { startDate, endDate, type } = filters;
  
  const where = {};
  if (type) where.type = type;
  
  if (startDate || endDate) {
    where.receivedDate = {};
    if (startDate) where.receivedDate.gte = new Date(startDate);
    if (endDate) where.receivedDate.lte = new Date(endDate);
  }
  
  const [
    total,
    byStatus,
    byPriority,
    byType,
  ] = await Promise.all([
    prisma.correspondence.count({ where }),
    prisma.correspondence.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.correspondence.groupBy({
      by: ['priority'],
      where,
      _count: true,
    }),
    prisma.correspondence.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),
  ]);
  
  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byPriority: byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {}),
    byType: byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {}),
  };
}

/**
 * Rastrear correspondencia por QR o referencia
 * @param {string} identifier - QR code o referencia
 * @returns {Promise<Object>} Información de rastreo
 */
async function trackCorrespondence(identifier) {
  const correspondence = await prisma.correspondence.findFirst({
    where: {
      OR: [
        { qrCode: identifier },
        { reference: identifier },
      ],
    },
  });
  
  if (!correspondence) {
    throw new NotFoundError('Correspondencia no encontrada');
  }
  
  return {
    reference: correspondence.reference,
    type: correspondence.type,
    status: correspondence.status,
    subject: correspondence.subject,
    receivedDate: correspondence.receivedDate,
    sentDate: correspondence.sentDate,
    deliveredAt: correspondence.deliveredAt,
    destinationDept: correspondence.destinationDept,
  };
}

export {
  createIncomingCorrespondence,
  createOutgoingCorrespondence,
  getCorrespondenceById,
  getCorrespondenceByReference,
  listCorrespondence,
  updateCorrespondence,
  markAsDelivered,
  markAsDispatched,
  archiveCorrespondence,
  deleteCorrespondence,
  getCorrespondenceStats,
  trackCorrespondence,
};
